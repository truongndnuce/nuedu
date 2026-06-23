import { apiFetch } from "./client";

export type ConvStatus = "open" | "assigned" | "closed";
export type MsgSenderType = "guest" | "staff" | "system";

export interface ConvListItem {
  id: string;
  guestName: string;
  guestPhone?: string;
  status: ConvStatus;
  unread: number;
  lastMessage?: string;
  createdAt: string;
}

export interface ConvDetail {
  id: string;
  guestName: string;
  guestPhone?: string;
  status: ConvStatus;
  assignedStaff?: { id: string; fullName: string } | null;
}

export interface ConvMessage {
  id: string;
  senderType: MsgSenderType;
  content: string;
  createdAt: string;
}

type BackendConvStatus = "OPEN" | "ASSIGNED" | "CLOSED";
type BackendSenderType = "GUEST" | "STAFF" | "SYSTEM";

function mapStatus(s: BackendConvStatus): ConvStatus {
  const map: Record<BackendConvStatus, ConvStatus> = {
    OPEN: "open",
    ASSIGNED: "assigned",
    CLOSED: "closed",
  };
  return map[s] ?? "open";
}

function mapSender(s: BackendSenderType): MsgSenderType {
  if (s === "STAFF") return "staff";
  if (s === "SYSTEM") return "system";
  return "guest";
}

function mapConv(raw: {
  id: string;
  status: BackendConvStatus;
  unreadByStaff: number;
  createdAt: string;
  guestSession: { displayName: string | null; phone?: string | null };
  messages?: { content: string }[];
}): ConvListItem {
  return {
    id: raw.id,
    guestName: raw.guestSession.displayName ?? "Guest",
    guestPhone: raw.guestSession.phone ?? undefined,
    status: mapStatus(raw.status),
    unread: raw.unreadByStaff,
    lastMessage: raw.messages?.[0]?.content,
    createdAt: raw.createdAt,
  };
}

interface RawConvListResponse {
  items: {
    id: string;
    status: BackendConvStatus;
    unreadByStaff: number;
    createdAt: string;
    guestSession: { displayName: string; phone?: string | null };
    messages?: { content: string }[];
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listConversations(params?: {
  status?: BackendConvStatus | "all";
  page?: number;
  limit?: number;
}): Promise<{ items: ConvListItem[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status && params.status !== "all") q.set("status", params.status);
  const qs = q.toString();
  const res = await apiFetch<RawConvListResponse>(
    `/chat/conversations${qs ? `?${qs}` : ""}`,
  );
  return {
    items: res.items.map(mapConv),
    total: res.total,
  };
}

export async function getConversation(id: string): Promise<ConvDetail> {
  const raw = await apiFetch<{
    id: string;
    status: BackendConvStatus;
    guestSession: { displayName: string; phone?: string | null };
    assignedStaff: { id: string; fullName: string } | null;
  }>(`/chat/conversations/${id}`);
  return {
    id: raw.id,
    guestName: raw.guestSession.displayName,
    guestPhone: raw.guestSession.phone ?? undefined,
    status: mapStatus(raw.status),
    assignedStaff: raw.assignedStaff,
  };
}

export async function getMessages(
  conversationId: string,
  before?: string,
): Promise<ConvMessage[]> {
  const q = before ? `?before=${encodeURIComponent(before)}` : "";
  const res = await apiFetch<{
    messages: {
      id: string;
      senderType: BackendSenderType;
      content: string;
      createdAt: string;
    }[];
  }>(`/chat/conversations/${conversationId}/messages${q}`);
  return res.messages.map((m) => ({
    id: m.id,
    senderType: mapSender(m.senderType),
    content: m.content,
    createdAt: m.createdAt,
  }));
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ConvMessage> {
  const raw = await apiFetch<{ id: string; senderType: BackendSenderType; content: string; createdAt: string }>(
    `/chat/conversations/${conversationId}/messages`,
    { method: "POST", body: JSON.stringify({ content }) },
  );
  return { id: raw.id, senderType: mapSender(raw.senderType), content: raw.content, createdAt: raw.createdAt };
}

export function assignToSelf(conversationId: string): Promise<void> {
  return apiFetch(`/chat/conversations/${conversationId}/assign`, {
    method: "POST",
    body: JSON.stringify({ self: true }),
  });
}

export function closeConversation(conversationId: string): Promise<void> {
  return apiFetch(`/chat/conversations/${conversationId}/close`, {
    method: "POST",
  });
}

export function markRead(conversationId: string): Promise<void> {
  return apiFetch(`/chat/conversations/${conversationId}/read`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function setStaffTyping(conversationId: string): Promise<void> {
  return apiFetch(`/chat/conversations/${conversationId}/typing`, { method: "PUT" });
}

export function getConversationTyping(conversationId: string): Promise<{ guestTyping: boolean }> {
  return apiFetch(`/chat/conversations/${conversationId}/typing`);
}

// ── Guest API (no JWT, uses nuedu_guest_id cookie) ──────────────────────────

const GUEST_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function guestFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GUEST_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const b = await res.json(); msg = b.message ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

export interface GuestSessionInfo {
  id: string;
  displayName: string;
}

export async function initGuestSession(): Promise<GuestSessionInfo> {
  return guestFetch<GuestSessionInfo>("/chat/guest/session", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export interface GuestConversationData {
  id: string;
  status: ConvStatus;
  messages: ConvMessage[];
}

export async function getGuestConversation(): Promise<GuestConversationData | null> {
  try {
    const raw = await guestFetch<{
      conversation: { id: string; status: BackendConvStatus };
      messages: { id: string; senderType: BackendSenderType; content: string; createdAt: string }[];
    } | null>("/chat/guest/conversation");
    if (!raw) return null;
    return {
      id: raw.conversation.id,
      status: mapStatus(raw.conversation.status),
      messages: raw.messages.map((m) => ({
        id: m.id,
        senderType: mapSender(m.senderType),
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  } catch (e) {
    // 404 = no active conversation, not an error
    if (e instanceof Error && (e.message.includes("404") || e.message.includes("No active conversation"))) return null;
    throw e;
  }
}

export async function setGuestTyping(): Promise<void> {
  await guestFetch("/chat/guest/typing", { method: "PUT" });
}

export async function getGuestTyping(): Promise<{ staffTyping: boolean }> {
  return guestFetch("/chat/guest/typing");
}

export async function sendGuestMessage(content: string, conversationId?: string): Promise<ConvMessage & { conversationId: string }> {
  const raw = await guestFetch<{
    id: string;
    conversationId: string;
    senderType: BackendSenderType;
    content: string;
    createdAt: string;
  }>("/chat/guest/messages", {
    method: "POST",
    body: JSON.stringify({ content, ...(conversationId ? { conversationId } : {}) }),
  });
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    senderType: mapSender(raw.senderType),
    content: raw.content,
    createdAt: raw.createdAt,
  };
}
