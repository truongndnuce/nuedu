"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostEditor } from "@/components/portal/posts/PostEditor";
import { FeaturedImagePicker } from "@/components/portal/posts/FeaturedImagePicker";
import { categories, createPost } from "@/fixtures/posts";
import { ArrowLeft } from "lucide-react";

const postSchema = z.object({
  titleVi: z.string().min(1, "Tiêu đề tiếng Việt bắt buộc"),
  titleEn: z.string().optional(),
  contentVi: z.string().optional(),
  contentEn: z.string().optional(),
  excerptVi: z.string().optional(),
  excerptEn: z.string().optional(),
  featuredImage: z.string().optional(),
  categorySlug: z.string().min(1),
  status: z.enum(["published", "draft", "scheduled"]),
  metaTitleVi: z.string().optional(),
  metaDescriptionVi: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const [seoOpen, setSeoOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      categorySlug: categories[0].slug,
      status: "draft",
      contentVi: "",
      contentEn: "",
    },
  });

  function onSubmit(data: PostFormData, status: "published" | "draft") {
    const category = categories.find((c) => c.slug === data.categorySlug)!;
    createPost({
      slug:
        data.titleVi
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now(),
      titleVi: data.titleVi,
      titleEn: data.titleEn ?? data.titleVi,
      excerptVi: data.excerptVi ?? "",
      excerptEn: data.excerptEn ?? data.excerptVi ?? "",
      contentVi: data.contentVi ?? "",
      contentEn: data.contentEn ?? "",
      featuredImage: data.featuredImage,
      status,
      publishedAt: new Date().toISOString(),
      category,
      tags: [],
      author: { id: "1", name: "Admin NUEDU" },
      metaTitleVi: data.metaTitleVi,
      metaDescriptionVi: data.metaDescriptionVi,
    });
    router.push(`/${locale}/portal/posts`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Tạo bài viết mới</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-4">
          {/* Lang tabs */}
          <div className="flex gap-1 border-b border-border">
            {(["vi", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === lang
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {lang === "vi" ? "Tiếng Việt" : "English"}
              </button>
            ))}
          </div>

          {activeTab === "vi" ? (
            <>
              <input
                {...register("titleVi")}
                placeholder="Tiêu đề (tiếng Việt)"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.titleVi && (
                <p className="text-xs text-destructive">
                  {errors.titleVi.message}
                </p>
              )}
              <input
                {...register("excerptVi")}
                placeholder="Mô tả ngắn..."
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Controller
                name="contentVi"
                control={control}
                render={({ field }) => (
                  <PostEditor
                    content={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Nội dung tiếng Việt..."
                  />
                )}
              />
            </>
          ) : (
            <>
              <input
                {...register("titleEn")}
                placeholder="Title (English)"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-lg font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                {...register("excerptEn")}
                placeholder="Short description..."
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Controller
                name="contentEn"
                control={control}
                render={({ field }) => (
                  <PostEditor
                    content={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="English content..."
                  />
                )}
              />
            </>
          )}

          {/* SEO Accordion */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30"
            >
              <span>SEO</span>
              <span>{seoOpen ? "▲" : "▼"}</span>
            </button>
            {seoOpen && (
              <div className="border-t border-border p-4 space-y-3">
                <input
                  {...register("metaTitleVi")}
                  placeholder="Meta title (VI)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  {...register("metaDescriptionVi")}
                  placeholder="Meta description (VI)"
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish card */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Xuất bản</h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, "published"))}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                Đăng ngay
              </button>
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, "draft"))}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Lưu nháp
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Danh mục</h3>
            <select
              {...register("categorySlug")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.nameVi}
                </option>
              ))}
            </select>
          </div>

          {/* Featured image */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Ảnh đại diện</h3>
            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <FeaturedImagePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
