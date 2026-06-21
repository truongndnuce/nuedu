"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import {
  initGuestSession,
  getGuestConversation,
  sendGuestMessage,
  type ConvMessage,
} from "@/lib/api/chat.api";

export type ChatMessage = ConvMessage;

const WELCOME: ChatMessage = {
  id: "welcome",
  content: "Xin chào! Chúng tôi có thể giúp gì cho bạn? 👋",
  senderType: "staff",
  createdAt: new Date().toISOString(),
};

export function useGuestChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isConnected] = useState(false);
  const [isTyping] = useState(false);
  const convIdRef = useRef<string | null>(null);

  // Keep ref in sync so the polling closure always reads the latest value
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // On mount: init guest session and load any existing conversation
  useEffect(() => {
    let cancelled = false;
    initGuestSession()
      .then(() => getGuestConversation())
      .then((conv) => {
        if (cancelled || !conv) return;
        setConversationId(conv.id);
        if (conv.messages.length > 0) {
          setMessages([WELCOME, ...conv.messages]);
        }
      })
      .catch(() => { /* fail silently — widget still usable */ });
    return () => { cancelled = true; };
  }, []);

  // Poll every 5 s for new messages once we have a conversation
  useEffect(() => {
    if (!conversationId) return;
    const t = setInterval(() => {
      getGuestConversation()
        .then((conv) => {
          if (!conv) return;
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = conv.messages.filter((m) => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...fresh];
          });
        })
        .catch(() => { /* ignore polling errors */ });
    }, 5_000);
    return () => clearInterval(t);
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string) => {
    if (sending) return; // prevent double-submit

    // Ensure we have a conversationId (created lazily on first GET /guest/conversation)
    let convId = convIdRef.current;
    if (!convId) {
      try {
        const conv = await getGuestConversation();
        if (conv) {
          convId = conv.id;
          setConversationId(conv.id);
          convIdRef.current = conv.id;
        }
      } catch {
        // ignore — will fail at send and show error
      }
    }

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      content,
      senderType: "guest",
      createdAt: new Date().toISOString(),
    };

    // flushSync ensures this render completes before the async await below,
    // preventing React 19 batching from merging add + remove into a no-op
    flushSync(() => {
      setSendError(null);
      setSending(true);
      setMessages((prev) => [...prev, optimistic]);
    });

    try {
      if (!convId) throw new Error("Không tìm thấy cuộc hội thoại");
      const real = await sendGuestMessage(convId, content);
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? real : m)));
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Gửi thất bại");
      // Keep optimistic message visible so user doesn't lose their text
    } finally {
      setSending(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sending]);

  return { messages, sendMessage, isConnected, isTyping, sendError, sending };
}
