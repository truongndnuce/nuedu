"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import {
  initGuestSession,
  getGuestConversation,
  sendGuestMessage,
  setGuestTyping,
  getGuestTyping,
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
  const [isTyping, setIsTyping] = useState(false);
  const convIdRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  // Keep ref in sync so the polling closure always reads the latest value
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // On mount: init guest session, then restore existing active conversation
  useEffect(() => {
    async function init() {
      await initGuestSession();
      try {
        const conv = await getGuestConversation();
        if (conv && conv.status !== "closed") {
          setConversationId(conv.id);
          convIdRef.current = conv.id;
          if (conv.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const fresh = conv.messages.filter((m) => !existingIds.has(m.id));
              return fresh.length ? [...prev, ...fresh] : prev;
            });
          }
        }
      } catch {
        // No existing conversation — guest will start fresh on first message
      }
    }
    init().catch(() => {});
  }, []);

  // Poll every 5 s for new messages once we have a conversation
  useEffect(() => {
    if (!conversationId) return;
    const t = setInterval(() => {
      if (sendingRef.current) return; // skip while send is in-flight to avoid race
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

  // Poll staff typing state every 2 s
  useEffect(() => {
    if (!conversationId) return;
    const t = setInterval(() => {
      getGuestTyping()
        .then(({ staffTyping }) => setIsTyping(staffTyping))
        .catch(() => {});
    }, 2_000);
    return () => clearInterval(t);
  }, [conversationId]);

  const sendMessage = useCallback(async (content: string) => {
    // Use ref for immediate synchronous lock — state guard would miss the async window
    if (sendingRef.current) return;
    sendingRef.current = true;

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      content,
      senderType: "guest",
      createdAt: new Date().toISOString(),
    };

    flushSync(() => {
      setSendError(null);
      setSending(true);
      setMessages((prev) => [...prev, optimistic]);
    });

    try {
      // Backend find-or-creates conversation automatically; pass conversationId if we already know it
      const real = await sendGuestMessage(content, convIdRef.current ?? undefined);
      // Backend returns the conversationId — persist it so polls can use it
      if (real.conversationId && !convIdRef.current) {
        convIdRef.current = real.conversationId;
        setConversationId(real.conversationId);
      }
      setMessages((prev) => {
        // Replace optimistic with real, then deduplicate in case poll already added real
        const replaced = prev.map((m) => (m.id === optimisticId ? real : m));
        const seen = new Set<string>();
        return replaced.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Gửi thất bại");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifyTyping = useCallback(() => {
    if (!convIdRef.current) return;
    setGuestTyping().catch(() => {});
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, []);

  return { messages, sendMessage, notifyTyping, isConnected, isTyping, sendError, sending };
}
