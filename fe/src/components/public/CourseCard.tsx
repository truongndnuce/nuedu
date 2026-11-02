"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/content/courses";

interface CourseCardProps {
  course: Course;
  locale: "vi" | "en";
  onRegister: () => void;
}

const labels = {
  vi: {
    schedule: "Lịch học",
    content: "Nội dung chính",
    practice: "Thực hành",
    certificate: "Chứng nhận & việc làm",
    register: "Đăng ký tư vấn",
    detail: "Xem chi tiết",
  },
  en: {
    schedule: "Schedule",
    content: "Key content",
    practice: "Practice",
    certificate: "Certificate & jobs",
    register: "Request consultation",
    detail: "View details",
  },
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-extrabold uppercase tracking-wide text-primary md:text-lg">
      {children}
    </h4>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  // Mobile: collapsed by default, tap to expand. md+: always expanded.
  const [open, setOpen] = useState(false);
  return (
    <section className="border-t border-border pt-4 first:border-t-0 first:pt-0 md:border-0 md:pt-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left md:pointer-events-none md:cursor-default"
      >
        <Heading>{title}</Heading>
        <span
          aria-hidden
          className={`text-xl font-bold leading-none text-primary transition-transform md:hidden ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div className={`mt-2 ${open ? "block" : "hidden"} md:block`}>{children}</div>
    </section>
  );
}

export function CourseCard({ course, locale, onRegister }: CourseCardProps) {
  const l = labels[locale];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <header className="bg-primary/10 px-5 pb-5 pt-5 transition-colors duration-300 group-hover:bg-primary/20 md:px-6">
        <span className="inline-block rounded-full bg-card px-3 py-1 text-xs font-bold uppercase text-primary">
          {course.badge[locale]}
        </span>
        <h3 className="mt-4 text-xl font-extrabold text-foreground md:text-2xl">
          {course.name[locale]}
        </h3>
        <p className="mt-1 text-3xl font-extrabold text-primary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none">
          {course.duration[locale]}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5 md:gap-5 md:p-6">
        <Collapsible title={l.schedule}>
          <p className="font-semibold text-foreground">{course.schedule.title[locale]}</p>
          <p className="mt-1 text-sm text-muted-foreground">{course.schedule.note[locale]}</p>
        </Collapsible>

        <Collapsible title={l.content}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground marker:text-primary">
            {course.content[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Collapsible>

        <Collapsible title={l.practice}>
          <p className="font-semibold text-foreground">{course.practice.title[locale]}</p>
          <p className="mt-1 text-sm text-muted-foreground">{course.practice.note[locale]}</p>
        </Collapsible>

        <Collapsible title={l.certificate}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground marker:text-primary">
            {course.certificate[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Collapsible>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onRegister}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-100 motion-reduce:transform-none"
          >
            {l.register}
          </button>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary"
          >
            {l.detail}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transform-none"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
