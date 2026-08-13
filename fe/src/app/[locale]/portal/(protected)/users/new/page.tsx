"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Copy, Eye, EyeOff } from "lucide-react";
import { createUser, type UserRole } from "@/lib/api/users.api";
import { listRoles, type ApiCustomRole } from "@/lib/api/roles.api";

const schema = z.object({
  fullName: z.string().min(1, "Bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["ADMIN", "STAFF"] as const),
  customRoleId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const locale = useLocale();
  const [roles, setRoles] = useState<ApiCustomRole[]>([]);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    listRoles().then(setRoles).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "STAFF" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const result = await createUser({
        fullName: data.fullName,
        email: data.email,
        role: data.role as UserRole,
        customRoleId: data.customRoleId || undefined,
      });
      if (result.temporaryPassword) {
        setCreatedPassword(result.temporaryPassword);
      } else {
        router.push(`/${locale}/portal/users`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tạo tài khoản");
    }
  }

  if (createdPassword) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Tạo tài khoản thành công</h1>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-4">
          <p className="text-sm text-green-800 font-medium">
            Tài khoản đã được tạo. Hãy gửi mật khẩu tạm thời này cho nhân viên:
          </p>
          <div className="flex items-center gap-3 bg-white rounded-lg border border-green-200 px-4 py-3">
            <code className="flex-1 text-lg font-mono font-bold tracking-widest text-foreground">
              {showPassword ? createdPassword : "•".repeat(createdPassword.length)}
            </code>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(createdPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sao chép"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-xs text-green-700">
            Nhân viên nên đổi mật khẩu ngay sau khi đăng nhập lần đầu.
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/portal/users`)}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Về danh sách nhân viên
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Thêm nhân viên</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tên đầy đủ</label>
          <input
            {...register("fullName")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Cấp độ hệ thống</label>
          <select
            {...register("role")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {selectedRole === "STAFF" && roles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Vai trò tùy chỉnh <span className="text-muted-foreground font-normal">(tùy chọn)</span>
            </label>
            <select
              {...register("customRoleId")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Không có (dùng quyền mặc định STAFF) —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          Mật khẩu tạm thời sẽ được tạo tự động và hiển thị sau khi tạo tài khoản.
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </div>
    </div>
  );
}
