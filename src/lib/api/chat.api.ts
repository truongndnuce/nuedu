import { apiFetch } from "./client";

export type ConvStatus = "open" | "assigned" | "closed";
export type MsgSenderType = "guest" | "staff";

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
type BackendSenderType = "GUEST" | "STAFF";

function mapStatus(s: BackendConvStatus): ConvStatus {
  const map: Record<BackendConvStatus, ConvStatus> = {
    OPEN: "open",
    ASSIGNED: "assigned",
    CLOSED: "closed",
  };
  return map[s] ?? "open";
}

function mapSender(s: BackendSenderType): MsgSenderType {
  return s === "STAFF" ? "staff" : "guest";
}

function mapConv(raw: {
  id: string;
  status: BackendConvStatus;
  unreadByStaff: number;
  createdAt: string;
  guestSession: { displayName: string; phone?: string | null };
  messages?: { content: string }[];
}): ConvListItem {
  return {
    id: raw.id,
    guestName: raw.guestSession.displayName,
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

export function sendMessage(
  conversationId: string,
  content: string,
): Promise<void> {
  return apiFetch(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
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
