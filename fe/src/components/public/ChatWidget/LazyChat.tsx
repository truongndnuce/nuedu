"use client";

import dynamic from "next/dynamic";

const ChatBubble = dynamic(
  () =>
    import("./ChatBubble").then((m) => m.ChatBubble),
  { ssr: false }
);

export function LazyChat() {
  return <ChatBubble />;
}
