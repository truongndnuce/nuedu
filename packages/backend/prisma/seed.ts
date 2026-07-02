import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // posts
  { key: 'posts.view', group: 'posts', description: 'View posts list/detail' },
  { key: 'posts.create', group: 'posts', description: 'Create new post' },
  { key: 'posts.update.own', group: 'posts', description: 'Edit own posts' },
  { key: 'posts.update.any', group: 'posts', description: 'Edit any post' },
  { key: 'posts.delete.own', group: 'posts', description: 'Delete own posts' },
  { key: 'posts.delete.any', group: 'posts', description: 'Delete any post' },
  { key: 'posts.publish', group: 'posts', description: 'Publish / unpublish' },
  { key: 'posts.schedule', group: 'posts', description: 'Schedule future publish' },
  // taxonomy
  { key: 'categories.view', group: 'taxonomy', description: 'View categories (admin)' },
  { key: 'categories.manage', group: 'taxonomy', description: 'CRUD categories' },
  { key: 'tags.view', group: 'taxonomy', description: 'View tags (admin)' },
  { key: 'tags.manage', group: 'taxonomy', description: 'CRUD tags' },
  // media
  { key: 'media.view', group: 'media', description: 'View media library' },
  { key: 'media.upload', group: 'media', description: 'Upload files' },
  { key: 'media.delete.own', group: 'media', description: 'Delete own uploads' },
  { key: 'media.delete.any', group: 'media', description: 'Delete any upload' },
  // chat
  { key: 'chat.read.all', group: 'chat', description: 'See all conversations' },
  { key: 'chat.read.assigned', group: 'chat', description: 'See only assigned conversations' },
  { key: 'chat.reply', group: 'chat', description: 'Send messages' },
  { key: 'chat.assign', group: 'chat', description: 'Assign/reassign conversations' },
  { key: 'chat.close', group: 'chat', description: 'Close conversations' },
  // trainers
  { key: 'trainers.view', group: 'trainers', description: 'View trainers (admin)' },
  { key: 'trainers.manage', group: 'trainers', description: 'CRUD trainers' },
  // testimonials
  { key: 'testimonials.view', group: 'testimonials', description: 'View testimonials (admin)' },
  { key: 'testimonials.manage', group: 'testimonials', description: 'CRUD testimonials' },
  // audit
  { key: 'audit.read', group: 'audit', description: 'Read audit logs (admin only)' },
];

// roles.manage / users.* / permissions.assign / settings.manage were removed —
// those pages are now hard-gated to UserRole.ADMIN via @AdminOnly(), not
// assignable per-role/per-user permissions.
const DEPRECATED_PERMISSION_KEYS = [
  'roles.manage',
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'permissions.assign',
  'settings.manage',
];

const STAFF_DEFAULT_PERMISSIONS = [
  'posts.view',
  'posts.create',
  'posts.update.own',
  'posts.delete.own',
  'posts.publish',
  'posts.schedule',
  'media.view',
  'media.upload',
  'media.delete.own',
  'chat.read.assigned',
  'chat.reply',
  'chat.close',
];

async function main() {
  console.log('Seeding database...');

  // Remove deprecated permissions (and any Role/CustomRole/User assignments
  // referencing them) — these pages are now hard-gated to ADMIN only.
  // RolePermission/UserPermission have no onDelete: Cascade on `permission`,
  // so their rows must be removed before the Permission rows themselves
  // (CustomRolePermission does cascade automatically).
  const deprecatedPerms = await prisma.permission.findMany({
    where: { key: { in: DEPRECATED_PERMISSION_KEYS } },
    select: { id: true },
  });
  const deprecatedPermIds = deprecatedPerms.map((p) => p.id);
  if (deprecatedPermIds.length > 0) {
    await prisma.rolePermission.deleteMany({ where: { permissionId: { in: deprecatedPermIds } } });
    await prisma.userPermission.deleteMany({ where: { permissionId: { in: deprecatedPermIds } } });
    await prisma.permission.deleteMany({ where: { id: { in: deprecatedPermIds } } });
  }
  console.log(`✓ ${deprecatedPermIds.length} deprecated permissions removed`);

  // Upsert all permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { group: perm.group, description: perm.description },
      create: perm,
    });
  }
  console.log(`✓ ${PERMISSIONS.length} permissions upserted`);

  const allPerms = await prisma.permission.findMany();
  const permByKey = new Map(allPerms.map((p) => [p.key, p]));

  // ADMIN gets all permissions
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: UserRole.ADMIN, permissionId: perm.id } },
      update: {},
      create: { role: UserRole.ADMIN, permissionId: perm.id },
    });
  }
  console.log(`✓ ADMIN role: all ${allPerms.length} permissions`);

  // STAFF gets default permissions
  for (const key of STAFF_DEFAULT_PERMISSIONS) {
    const perm = permByKey.get(key);
    if (!perm) continue;
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: UserRole.STAFF, permissionId: perm.id } },
      update: {},
      create: { role: UserRole.STAFF, permissionId: perm.id },
    });
  }
  console.log(`✓ STAFF role: ${STAFF_DEFAULT_PERMISSIONS.length} default permissions`);

  // Admin user
  const adminEmail = 'admin@nuedu.vn';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const passwordHash = await argon2.hash(adminPassword, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Super Admin',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // Default categories
  const DEFAULT_CATEGORIES = [
    { nameVi: 'Tập luyện', nameEn: 'Training', slug: 'training', order: 1 },
    { nameVi: 'Dinh dưỡng', nameEn: 'Nutrition', slug: 'nutrition', order: 2 },
    { nameVi: 'Phục hồi', nameEn: 'Recovery', slug: 'recovery', order: 3 },
    { nameVi: 'Tin tức học viện', nameEn: 'Academy News', slug: 'academy-news', order: 4 },
  ];

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameVi: cat.nameVi, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }
  console.log(`✓ ${DEFAULT_CATEGORIES.length} default categories upserted`);

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
