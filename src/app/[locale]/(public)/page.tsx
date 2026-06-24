import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Hero } from "@/components/public/Hero";
import { ServiceCard } from "@/components/public/ServiceCard";
import { TrainerCard } from "@/components/public/TrainerCard";
import { TestimonialMarquee } from "@/components/public/TestimonialMarquee";
import { LeadCapturePopup } from "@/components/public/LeadCapturePopup";
import type { ApiTrainer } from "@/lib/api/trainers.api";
import type { ApiTestimonial } from "@/lib/api/testimonials.api";
import Link from "next/link";
import {
  Apple,
  BadgeCheck,
  BriefcaseBusiness,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    image: "/images/gym/gym-workout.jpg",
    titleVi: "Giải phẫu & kỹ thuật tập",
    titleEn: "Anatomy & training technique",
    descVi: "Nắm nền tảng cơ xương khớp, chuyển động và kỹ thuật huấn luyện an toàn.",
    descEn: "Master musculoskeletal anatomy, movement patterns, and safe coaching technique.",
  },
  {
    icon: Apple,
    image: "/images/gym/gym-barbell.jpg",
    titleVi: "Dinh dưỡng & thực phẩm bổ sung",
    titleEn: "Nutrition & supplementation",
    descVi: "Thiết kế chế độ tăng cân, giảm cân, phục hồi và hiểu sản phẩm ngoài thị trường.",
    descEn: "Build gain, cut, and recovery nutrition plans while understanding supplements.",
  },
  {
    icon: HeartPulse,
    image: "/images/gym/gym-training.jpg",
    titleVi: "Huấn luyện khách hàng thực tế",
    titleEn: "Real client coaching",
    descVi: "Thực hành đánh giá thể trạng, lên giáo án và xử lý nhóm khách hàng đặc thù.",
    descEn: "Practice assessment, programming, and coaching for different client profiles.",
  },
  {
    icon: BriefcaseBusiness,
    image: "/images/gym/gym-academy-floor.jpg",
    titleVi: "Bán hàng & định hướng nghề",
    titleEn: "Sales & career direction",
    descVi: "Rèn quy trình tư vấn, chốt hợp đồng, xây thương hiệu cá nhân và lộ trình đi làm.",
    descEn: "Train consultation, closing, personal branding, and post-course career planning.",
  },
];

const trainingZones = [
  {
    image: "/images/gym/gym-academy-floor.jpg",
    vi: "Phòng học thực hành",
    en: "Hands-on classroom",
  },
  {
    image: "/images/gym/gym-dumbbells.jpg",
    vi: "Khu rèn kỹ thuật",
    en: "Technique lab",
  },
  {
    image: "/images/gym/gym-barbell.jpg",
    vi: "Độ body & thi đấu",
    en: "Body prep & competition",
  },
];

const outcomes = [
  {
    icon: BadgeCheck,
    vi: "Chứng chỉ hành nghề có giá trị toàn quốc",
    en: "Practice certificate with nationwide value",
  },
  {
    icon: Users,
    vi: "Sĩ số tối đa 20 học viên để giảng viên theo sát",
    en: "Maximum 20 students per class for close coaching",
  },
  {
    icon: BriefcaseBusiness,
    vi: "Hỗ trợ thực tập và giới thiệu việc làm sau tốt nghiệp",
    en: "Internship support and job referral after graduation",
  },
  {
    icon: ShieldCheck,
    vi: "Bảo hành khóa học, được dự thính để củng cố kiến thức",
    en: "Course warranty with audit sessions for knowledge reinforcement",
  },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function fetchTrainers(): Promise<ApiTrainer[]> {
  try {
    const res = await fetch(`${API_BASE}/trainers`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchTestimonials(): Promise<ApiTestimonial[]> {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [t, tc, locale] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getLocale(),
  ]);
  const [trainers, testimonials] = await Promise.all([
    fetchTrainers(),
    fetchTestimonials(),
  ]);

  return (
    <>
      <Hero />

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-primary">
                {locale === "vi" ? "Khóa học nghề PT" : "PT career program"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-5xl">
                {t("servicesTitle")}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {locale === "vi"
                ? "Chương trình đào tạo huấn luyện viên thể hình đi từ nền tảng khoa học đến thực chiến bán hàng và làm nghề."
                : "A personal trainer program that moves from science foundations to real coaching, sales, and career execution."}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.titleEn} {...service} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20">
        <Image
          src="/images/gym/gym-workout.jpg"
          alt="NUEDU gym workout background"
          fill
          sizes="100vw"
          className="object-cover opacity-28"
        />
        <div className="absolute inset-0 bg-primary/82" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-accent">
              {locale === "vi" ? "Học xen kẽ lý thuyết và vận động" : "Theory mixed with practical work"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">
              {locale === "vi"
                ? "Không chỉ học bài, học viên phải làm được nghề"
                : "Students do not just study, they learn to work"}
            </h2>
            <p className="mt-4 text-base leading-8 text-white/72">
              {locale === "vi"
                ? "Nội dung học bám sát nhu cầu tuyển dụng: hiểu cơ thể, biết lên giáo án, biết tư vấn khách hàng và có môi trường thực tập."
                : "The program follows hiring needs: understand the body, build programs, consult clients, and train in real environments."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trainingZones.map((zone, index) => (
              <div
                key={zone.en}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-white/12 bg-white/10"
              >
                <Image
                  src={zone.image}
                  alt={locale === "vi" ? zone.vi : zone.en}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 text-xs font-black text-accent">
                    0{index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {locale === "vi" ? zone.vi : zone.en}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((item) => (
              <div
                key={item.en}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <p className="text-sm font-bold leading-6 text-foreground">
                  {locale === "vi" ? item.vi : item.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-center justify-between gap-4 sm:mb-12">
            <h2 className="text-3xl font-black text-foreground sm:text-5xl">
              {t("trainersTitle")}
            </h2>
            <Link
              href={`/${locale}/trainers`}
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {tc("seeAll")}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-secondary py-16 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 sm:mb-12 text-center">
              <p className="text-sm font-bold uppercase text-primary">
                {locale === "vi" ? "Học viên nói gì" : "What students say"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-5xl">
                {locale === "vi"
                  ? "Phản hồi từ học viên"
                  : "Student testimonials"}
              </h2>
            </div>
          </div>
          <TestimonialMarquee testimonials={testimonials} locale={locale} />
        </section>
      )}

      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-accent">
              {locale === "vi" ? "Tuyển sinh khóa PT Gym" : "PT Gym enrollment"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">
              {locale === "vi"
                ? "Trở thành huấn luyện viên thể hình chuyên nghiệp"
                : "Become a professional personal trainer"}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
              {locale === "vi"
                ? "NUEDU đào tạo từ kiến thức, kỹ năng, độ body đến tư vấn nghề nghiệp để học viên có thể bắt đầu làm PT sau khóa học."
                : "NUEDU trains knowledge, skills, body preparation, and career consulting so students can start working as PTs after the program."}
            </p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Target size={24} aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm text-white/64">Hotline</div>
                <div className="text-2xl font-black text-white">086.777.0689</div>
              </div>
            </div>
            <Link
              href={`/${locale}/about`}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-black text-accent-foreground transition-colors hover:bg-accent/90"
            >
              {locale === "vi" ? "Đăng ký tư vấn khóa học" : "Request program consultation"}
              <Trophy size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <LeadCapturePopup locale={locale} />
    </>
  );
}
