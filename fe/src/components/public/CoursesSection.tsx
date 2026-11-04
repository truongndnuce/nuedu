"use client";

import { useState } from "react";
import { courses } from "@/content/courses";
import { CourseCard } from "./CourseCard";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { Reveal } from "./Reveal";

const copy = {
  vi: {
    eyebrow: "Chương trình đào tạo",
    title: "Khám phá các khóa học tại NuEdu",
    subtitle: "Thông tin chương trình, lịch học và hình thức đào tạo",
    ctaTitle: "Cần thêm thông tin về chương trình?",
    ctaText: "Để lại thông tin để NuEdu tư vấn lịch học và nội dung đào tạo.",
    ctaButton: "Nhận tư vấn",
  },
  en: {
    eyebrow: "Training programs",
    title: "Explore courses at NuEdu",
    subtitle: "Program details, schedules and learning formats",
    ctaTitle: "Need more information about the programs?",
    ctaText: "Leave your details and NuEdu will advise on schedules and curriculum.",
    ctaButton: "Get consultation",
  },
};

export function CoursesSection({ locale }: { locale: string }) {
  const lang = locale === "en" ? "en" : "vi";
  const c = copy[lang];
  const [open, setOpen] = useState(false);

  return (
    <section id="courses" className="mt-20 scroll-mt-24">
      <div className="mb-10 text-center">
        <p className="text-base font-bold uppercase tracking-widest text-primary">{c.eyebrow}</p>
        <h2 className="mt-2 text-4xl font-extrabold text-foreground sm:text-5xl">{c.title}</h2>
        <p className="mt-3 text-lg text-muted-foreground sm:text-xl">{c.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {courses.map((course, i) => (
          <Reveal key={course.id} delay={i * 100} className="h-full">
            <CourseCard course={course} locale={lang} onRegister={() => setOpen(true)} />
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-border bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{c.ctaTitle}</h3>
          <p className="mt-1 text-base text-muted-foreground">{c.ctaText}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full shrink-0 rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg sm:w-auto motion-reduce:transform-none"
        >
          {c.ctaButton}
        </button>
      </div>

      {open && <LeadCaptureModal locale={locale} onClose={() => setOpen(false)} />}
    </section>
  );
}
