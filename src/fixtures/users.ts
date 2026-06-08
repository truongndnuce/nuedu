export type UserRole = "admin" | "editor" | "author";
export type UserStatus = "active" | "inactive";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  permissions: string[];
}

export const ALL_PERMISSIONS = [
  // Posts
  { key: "posts.create", group: "Bài viết", label: "Tạo bài viết" },
  { key: "posts.update.own", group: "Bài viết", label: "Sửa bài viết của mình" },
  { key: "posts.update.any", group: "Bài viết", label: "Sửa mọi bài viết" },
  { key: "posts.delete.any", group: "Bài viết", label: "Xóa bài viết" },
  { key: "posts.publish", group: "Bài viết", label: "Đăng bài" },
  { key: "posts.schedule", group: "Bài viết", label: "Lên lịch bài viết" },
  // Categories/Tags
  { key: "categories.manage", group: "Danh mục & Thẻ", label: "Quản lý danh mục" },
  { key: "tags.manage", group: "Danh mục & Thẻ", label: "Quản lý thẻ" },
  // Chat
  { key: "chat.read.all", group: "Chat", label: "Đọc tất cả cuộc chat" },
  { key: "chat.read.assigned", group: "Chat", label: "Đọc chat được giao" },
  { key: "chat.assign", group: "Chat", label: "Giao chat" },
  { key: "chat.close", group: "Chat", label: "Đóng cuộc chat" },
  // Media
  { key: "media.upload", group: "Thư viện ảnh", label: "Tải ảnh lên" },
  { key: "media.delete", group: "Thư viện ảnh", label: "Xóa ảnh" },
  // Users
  { key: "users.manage", group: "Người dùng", label: "Quản lý người dùng" },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.key),
  editor: [
    "posts.create",
    "posts.update.own",
    "posts.update.any",
    "posts.delete.any",
    "posts.publish",
    "posts.schedule",
    "categories.manage",
    "tags.manage",
    "chat.read.all",
    "chat.assign",
    "chat.close",
    "media.upload",
    "media.delete",
  ],
  author: [
    "posts.create",
    "posts.update.own",
    "media.upload",
    "chat.read.assigned",
  ],
};

let usersStore: StaffUser[] = [
  {
    id: "1",
    name: "Admin NUEDU",
    email: "admin@nuedu.vn",
    role: "admin",
    status: "active",
    lastLogin: "2026-06-08T07:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.admin,
  },
  {
    id: "2",
    name: "Biên tập viên 1",
    email: "editor@nuedu.vn",
    role: "editor",
    status: "active",
    lastLogin: "2026-06-07T15:30:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.editor,
  },
  {
    id: "3",
    name: "Tác giả Tuấn",
    email: "tuan@nuedu.vn",
    role: "author",
    status: "active",
    lastLogin: "2026-06-06T09:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.author,
  },
];

export function getAllUsers(): StaffUser[] {
  return usersStore;
}

export function getUserById(id: string): StaffUser | undefined {
  return usersStore.find((u) => u.id === id);
}

export function createUser(data: Omit<StaffUser, "id">): StaffUser {
  const user: StaffUser = { ...data, id: String(Date.now()) };
  usersStore = [...usersStore, user];
  return user;
}

export function updateUser(id: string, data: Partial<StaffUser>): boolean {
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  usersStore[idx] = { ...usersStore[idx], ...data };
  return true;
}
