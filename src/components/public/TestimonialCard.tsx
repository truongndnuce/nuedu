import Image from "next/image";
import { Quote } from "lucide-react";
import type { ApiTestimonial } from "@/lib/api/testimonials.api";

interface TestimonialCardProps {
  testimonial: ApiTestimonial;
  locale: string;
}

export function TestimonialCard({ testimonial, locale }: TestimonialCardProps) {
  const content =
    locale === "vi" ? testimonial.contentVi : testimonial.contentEn;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <Quote size={28} className="mb-4 shrink-0 text-primary/30" />
      <p className="flex-1 text-sm leading-7 text-muted-foreground">{content}</p>
      <div className="mt-6 flex items-center gap-3">
        {testimonial.avatar ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}
