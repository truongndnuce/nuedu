"use client";

import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  content: string;
  senderType: "guest" | "staff";
  createdAt: string;
}

export function useGuestChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content:
        "Xin chào! Chúng tôi có thể giúp gì cho bạn? 👋",
      senderType: "staff",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isConnected] = useState(false); // socket disabled in dev
  const [isTyping] = useState(false);

  const sendMessage = useCallback((content: string) => {
    const guestMsg: ChatMessage = {
      id: "g-" + Date.now(),
      content,
      senderType: "guest",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, guestMsg]);

    // Mock auto-reply after 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "s-" + Date.now(),
          content:
            "Cảm ơn bạn đã liên hệ! Nhân viên sẽ phản hồi sớm nhất có thể.",
          senderType: "staff",
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 1500);
  }, []);

  return { messages, sendMessage, isConnected, isTyping };
}
