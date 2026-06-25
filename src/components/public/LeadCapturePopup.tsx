"use client";

import { useEffect, useState } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";

interface Props {
  locale: string;
}

const STORAGE_KEY = "lead_popup_dismissed";
const DELAY_MS = 15_000;

export function LeadCapturePopup({ locale }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY)) return;

    const id = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  if (!open) return null;

  return (
    <LeadCaptureModal
      locale={locale}
      onClose={() => {
        setOpen(false);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }}
    />
  );
}
