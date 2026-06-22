"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useAuthStore } from "@/lib/auth/authStore";
import { updateSelfProfile } from "@/lib/api/users.api";

export default function AccountPage() {
  const { user } = useAuth();
  const { setAuth, accessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile tab state
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  async function handleSaveProfile() {
    if (!fullName.trim()) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await updateSelfProfile({ fullName: fullName.trim() });
      // Update the local auth store so Topbar reflects new name immediately
      if (user && accessToken) {
        setAuth({ ...user, name: fullName.trim() }, accessToken);
      }
      setProfileSuccess(true);
    } catch (e: unknown) {
      setProfileError(e instanceof Error ? e.message : "Lỗi khi lưu hồ sơ");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    setSecurityError(null);
    setSecuritySuccess(false);
    if (!currentPassword || !newPassword) {
      setSecurityError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("Xác nhận mật khẩu không khớp");
      return;
    }
    setSecuritySaving(true);
    try {
      await updateSelfProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSecuritySuccess(true);
    } catch (e: unknown) {
      setSecurityError(e instanceof Error ? e.message : "Lỗi khi đổi mật khẩu");
    } finally {
      setSecuritySaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["profile", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab === "profile" ? "Hồ sơ" : "Bảo mật"}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {profileSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Đã lưu thay đổi thành công.
            </div>
          )}
          {profileError && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{profileError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tên hiển thị</label>
            <input
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setProfileSuccess(false); }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              value={user?.email ?? ""}
              readOnly
              className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vai trò</label>
            <input
              value={user?.role === "admin" ? "Admin" : "Nhân viên"}
              readOnly
              className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed capitalize"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={profileSaving || !fullName.trim()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {securitySuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Mật khẩu đã được đổi thành công.
            </div>
          )}
          {securityError && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{securityError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setSecuritySuccess(false); }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setSecuritySuccess(false); }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSecuritySuccess(false); }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={securitySaving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {securitySaving ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      )}
    </div>
  );
}
