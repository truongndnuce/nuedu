"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostEditor } from "@/components/portal/posts/PostEditor";
import { FeaturedImagePicker, type FeaturedImageResult } from "@/components/portal/posts/FeaturedImagePicker";
import { SchedulePicker } from "@/components/portal/posts/SchedulePicker";
import { listCategories, type Category } from "@/lib/api/categories.api";
import {
  getPost,
  updatePost,
  publishPost,
  unpublishPost,
  schedulePost,
  unschedulePost,
  type ApiPost,
} from "@/lib/api/posts.api";
import { ApiError } from "@/lib/api/client";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const postSchema = z.object({
  titleVi: z.string().min(1),
  titleEn: z.string().optional(),
  contentVi: z.string().optional(),
  contentEn: z.string().optional(),
  excerptVi: z.string().optional(),
  excerptEn: z.string().optional(),
  categoryId: z.string().optional(),
  metaTitleVi: z.string().optional(),
  metaDescriptionVi: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const [seoOpen, setSeoOpen] = useState(false);
  const [post, setPost] = useState<ApiPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<FeaturedImageResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      titleVi: "",
      titleEn: "",
      contentVi: "",
      contentEn: "",
      excerptVi: "",
      excerptEn: "",
      categoryId: "",
      metaTitleVi: "",
      metaDescriptionVi: "",
    },
  });

  useEffect(() => {
    Promise.all([getPost(id), listCategories()])
      .then(([p, cats]) => {
        setPost(p);
        setCategories(cats);
        if (p.images?.length) {
          setImages(p.images.map((img) => ({ mediaId: img.id, url: img.cloudinaryUrl })));
        }
        form.reset({
          titleVi: p.titleVi,
          titleEn: p.titleEn ?? "",
          contentVi: p.contentVi ?? "",
          contentEn: p.contentEn ?? "",
          excerptVi: p.excerptVi ?? "",
          excerptEn: p.excerptEn ?? "",
          categoryId: p.category?.id ?? "",
          metaTitleVi: p.metaTitleVi ?? "",
          metaDescriptionVi: p.metaDescriptionVi ?? "",
        });
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          notFound();
        }
        setError(e.message);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(data: PostFormData, publish: boolean) {
    if (!post) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePost(id, {
        titleVi: data.titleVi,
        titleEn: data.titleEn || data.titleVi,
        excerptVi: data.excerptVi,
        excerptEn: data.excerptEn || data.excerptVi,
        contentVi: data.contentVi,
        contentEn: data.contentEn || data.contentVi,
        categoryId: data.categoryId || undefined,
        imageIds: images.map((img) => img.mediaId),
        metaTitleVi: data.metaTitleVi,
        metaDescriptionVi: data.metaDescriptionVi,
      });

      if (publish) {
        await publishPost(id);
      } else if (post.status === "PUBLISHED") {
        await unpublishPost(id);
      }

      router.push(`/${locale}/portal/posts`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu bài viết");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSchedule(isoDate: string) {
    if (!post) return;
    setScheduling(true);
    setError(null);
    try {
      const data = form.getValues();
      await updatePost(id, {
        titleVi: data.titleVi,
        titleEn: data.titleEn || data.titleVi,
        excerptVi: data.excerptVi,
        excerptEn: data.excerptEn || data.excerptVi,
        contentVi: data.contentVi,
        contentEn: data.contentEn || data.contentVi,
        categoryId: data.categoryId || undefined,
        imageIds: images.map((img) => img.mediaId),
        metaTitleVi: data.metaTitleVi,
        metaDescriptionVi: data.metaDescriptionVi,
      });
      const updated = await schedulePost(id, isoDate);
      setPost(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lên lịch bài viết");
    } finally {
      setScheduling(false);
    }
  }

  async function handleUnschedule() {
    if (!post) return;
    setScheduling(true);
    setError(null);
    try {
      const updated = await unschedulePost(id);
      setPost(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi hủy lịch");
    } finally {
      setScheduling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          Chỉnh sửa bài viết
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
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
                <p className="text-xs text-destructive">Tiêu đề tiếng Việt bắt buộc</p>
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
                  />
                )}
              />
            </>
          )}

          <div className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30"
            >
              SEO <span>{seoOpen ? "▲" : "▼"}</span>
            </button>
            {seoOpen && (
              <div className="border-t border-border p-4 space-y-3">
                <input
                  {...register("metaTitleVi")}
                  placeholder="Meta title (VI)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  {...register("metaDescriptionVi")}
                  placeholder="Meta description (VI)"
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Xuất bản</h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, true), (errs) => console.error("Form validation failed:", errs))}
                disabled={submitting || scheduling}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Đang lưu..." : "Đăng ngay"}
              </button>
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, false), (errs) => console.error("Form validation failed:", errs))}
                disabled={submitting || scheduling}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Lưu nháp
              </button>
            </div>
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs text-muted-foreground">Hoặc lên lịch đăng</p>
              <SchedulePicker
                currentStatus={post.status}
                scheduledAt={post.scheduledAt}
                onSchedule={handleSchedule}
                onUnschedule={handleUnschedule}
                disabled={submitting || scheduling}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Danh mục</h3>
            <select
              {...register("categoryId")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameVi}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Ảnh bài viết
            </h3>
            <FeaturedImagePicker
              images={images}
              onChange={setImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
