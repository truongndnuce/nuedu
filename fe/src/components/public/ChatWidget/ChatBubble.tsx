"use client";

import { useState } from "react";
import { MessageCircle, X, ClipboardList } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { LeadCaptureModal } from "../LeadCaptureModal";
import { useLocale } from "next-intl";

export function ChatBubble() {
  const [chatOpen, setChatOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat panel */}
        {chatOpen && (
          <div className="w-80 h-[440px] rounded-xl border border-border shadow-xl overflow-hidden">
            <ChatPanel onClose={() => setChatOpen(false)} />
          </div>
        )}

        {/* Lead capture button */}
        <div className="flex flex-row-reverse items-center gap-2">
          <div className="relative">
            <span className="absolute -inset-1 animate-ping rounded-full bg-primary/40" />
            <button
              onClick={() => setLeadOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
              aria-label={locale === "vi" ? "Đăng ký tư vấn" : "Get consultation"}
            >
              <ClipboardList size={22} />
            </button>
          </div>
          <span className="whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-lg">
            {locale === "vi" ? "Đăng ký tư vấn ngay" : "Register for consultation now"}
          </span>
        </div>

        {/* Chat bubble button */}
        <div className="flex flex-row-reverse items-center gap-2">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            aria-label={chatOpen ? "Đóng chat" : "Mở chat"}
          >
            {chatOpen ? <X size={22} /> : <MessageCircle size={22} />}
          </button>
          {!chatOpen && (
            <span className="whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-lg">
              {locale === "vi" ? "Chat tư vấn trực tiếp với chúng tôi" : "Chat directly with us"}
            </span>
          )}
        </div>
      </div>

      {leadOpen && <LeadCaptureModal locale={locale} onClose={() => setLeadOpen(false)} />}
    </>
  );
}
