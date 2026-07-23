import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Hero } from "@/components/public/Hero";
import { CurriculumCard } from "@/components/public/CurriculumCard";
import { GraduateOutcomes } from "@/components/public/GraduateOutcomes";
import { TrainerCard } from "@/components/public/TrainerCard";
import { TestimonialMarquee } from "@/components/public/TestimonialMarquee";
import { LeadCapturePopup } from "@/components/public/LeadCapturePopup";
import type { ApiTrainer } from "@/lib/api/trainers.api";
import type { ApiTestimonial } from "@/lib/api/testimonials.api";
import Link from "next/link";
import { Target, Trophy } from "lucide-react";

const curriculum = [
  {
    number: "01",
    titleVi: "Đại cương giải phẫu",
    titleEn: "Anatomy fundamentals",
    descVi: "Nền tảng khoa học về cơ thể người — hiểu để thiết kế bài tập đúng và an toàn.",
    descEn: "The science foundation of the human body — the basis for safe, correct programming.",
    tagsVi: ["Hệ cơ xương khớp", "Hệ thần kinh", "Tim mạch & hô hấp", "Sinh lý cơ vận"],
    tagsEn: ["Musculoskeletal system", "Nervous system", "Cardio & respiratory", "Muscle physiology"],
    durationVi: "11 buổi lý thuyết",
    durationEn: "11 theory sessions",
  },
  {
    number: "02",
    titleVi: "Khoa học dinh dưỡng",
    titleEn: "Nutrition science",
    descVi: "Thiết kế chế độ ăn khoa học theo từng mục tiêu — giảm mỡ, tăng cơ, hiệu suất.",
    descEn: "Build science-based diets for each goal — fat loss, muscle gain, performance.",
    tagsVi: ["TDEE & Macro", "Thời điểm nạp", "Supplement", "Thiết kế thực đơn"],
    tagsEn: ["TDEE & Macro", "Nutrient timing", "Supplements", "Meal planning"],
    durationVi: "14 buổi lý thuyết",
    durationEn: "14 theory sessions",
  },
  {
    number: "03",
    titleVi: "Thiết kế chương trình tập",
    titleEn: "Program design",
    descVi: "Lập giáo án theo mô hình OPT — từ thẩm định đến thiết kế lộ trình 12 tuần.",
    descEn: "Build training plans with the OPT model — from assessment to a 12-week roadmap.",
    tagsVi: ["OPT Model", "Inbody analysis", "Full body / Split", "Corrective exercise"],
    tagsEn: ["OPT Model", "Inbody analysis", "Full body / Split", "Corrective exercise"],
    durationVi: "12 buổi lý thuyết",
    durationEn: "12 theory sessions",
  },
  {
    number: "04",
    titleVi: "Tư vấn & Bán hàng",
    titleEn: "Consulting & sales",
    descVi: "Kỹ năng kiếm tiền của PT — tìm kiếm, tư vấn, chốt hợp đồng và giữ chân khách.",
    descEn: "The PT's income skillset — prospecting, consulting, closing, and client retention.",
    tagsVi: ["Telesale", "Đọc Inbody cho KH", "Xử lý từ chối", "Chăm sóc sau hợp đồng"],
    tagsEn: ["Telesales", "Reading client Inbody", "Objection handling", "Post-sale care"],
    durationVi: "12 buổi lý thuyết",
    durationEn: "12 theory sessions",
  },
  {
    number: "05",
    titleVi: "Thực hành chuyên sâu",
    titleEn: "Intensive practice",
    descVi: "Module nặng nhất — 59 buổi thực hành trực tiếp tại phòng gym NuEdu.",
    descEn: "The heaviest module — 59 hands-on sessions at the NuEdu training gym.",
    tagsVi: ["Kỹ thuật Squat/DL/BP", "Functional training", "Hypertrophy", "Plyometrics", "Stretching", "Xử lý chấn thương"],
    tagsEn: ["Squat/DL/BP technique", "Functional training", "Hypertrophy", "Plyometrics", "Stretching", "Injury handling"],
    durationVi: "59 buổi thực hành",
    durationEn: "59 practice sessions",
  },
  {
    number: "06",
    titleVi: "Giới thiệu việc làm",
    titleEn: "Job placement",
    descVi: "Cam kết đầu ra — kết nối học viên với 50+ phòng tập đối tác trên toàn quốc.",
    descEn: "Outcome commitment — connecting graduates with 50+ partner gyms nationwide.",
    tagsVi: ["CV & Portfolio PT", "Phỏng vấn", "Nutrition Fitness", "Network đối tác"],
    tagsEn: ["CV & PT portfolio", "Interviews", "Nutrition Fitness", "Partner network"],
    durationVi: "Cam kết sau TN",
    durationEn: "Guaranteed post-graduation",
  },
];

const trainingZones = [
  {
    image: "/images/gym/gym-classroom.jpg",
    vi: "Phòng học thực hành",
    en: "Hands-on classroom",
  },
  {
    image: "/images/gym/gym-technique-lab.jpg",
    vi: "Khu rèn kỹ thuật",
    en: "Technique lab",
  },
  {
    image: "/images/gym/gym-competition.jpg",
    vi: "Độ body & thi đấu",
    en: "Body prep & competition",
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
              <h2 className="mt-2 text-3xl font-black uppercase text-accent sm:text-5xl">
                {t("servicesTitle")}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {locale === "vi"
                ? "Chương trình đào tạo huấn luyện viên thể hình đi từ nền tảng khoa học đến thực chiến bán hàng và làm nghề."
                : "A personal trainer program that moves from science foundations to real coaching, sales, and career execution."}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((item) => (
              <CurriculumCard key={item.number} {...item} locale={locale} />
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

      <GraduateOutcomes locale={locale} />

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-center justify-between gap-4 sm:mb-12">
            <h2 className="text-3xl font-black uppercase text-accent sm:text-5xl">
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
              <h2 className="mt-2 text-3xl font-black uppercase text-accent sm:text-5xl">
                {locale === "vi"
                  ? "Học viên nói gì về NUEDU"
                  : "What students say about NUEDU"}
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
