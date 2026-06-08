"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { createUser, ROLE_DEFAULT_PERMISSIONS, type UserRole } from "@/fixtures/users";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["admin", "editor", "author"]),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "author" },
  });

  function onSubmit(data: FormData) {
    createUser({
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      status: "active",
      permissions: ROLE_DEFAULT_PERMISSIONS[data.role as UserRole],
    });
    router.push(`/${locale}/portal/users`);
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

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Tên
          </label>
          <input
            {...register("name")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Vai trò
          </label>
          <select
            {...register("role")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="author">Tác giả</option>
            <option value="editor">Biên tập viên</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          Tạo nhân viên
        </button>
      </div>
    </div>
  );
}
