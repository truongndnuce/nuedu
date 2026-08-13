export interface Message {
  id: string;
  content: string;
  senderType: "guest" | "staff";
  senderName: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  guestName: string;
  guestPhone?: string;
  status: "open" | "assigned" | "closed";
  assignedTo?: string;
  lastMessage: string;
  unread: number;
  createdAt: string;
  messages: Message[];
}

let conversations: Conversation[] = [
  {
    id: "conv-1",
    guestName: "Khách vô danh",
    status: "open",
    lastMessage: "Xin chào, tôi muốn hỏi về khóa học thể hình",
    unread: 2,
    createdAt: "2026-06-08T08:30:00Z",
    messages: [
      {
        id: "m1",
        content: "Xin chào, tôi muốn hỏi về khóa học thể hình",
        senderType: "guest",
        senderName: "Khách vô danh",
        createdAt: "2026-06-08T08:30:00Z",
      },
      {
        id: "m2",
        content: "Khóa học bắt đầu khi nào ạ?",
        senderType: "guest",
        senderName: "Khách vô danh",
        createdAt: "2026-06-08T08:31:00Z",
      },
    ],
  },
  {
    id: "conv-2",
    guestName: "Nguyễn Thị Lan",
    guestPhone: "0987654321",
    status: "assigned",
    assignedTo: "Admin NUEDU",
    lastMessage: "Cảm ơn bạn đã trả lời!",
    unread: 0,
    createdAt: "2026-06-07T14:00:00Z",
    messages: [
      {
        id: "m3",
        content: "Học phí một tháng là bao nhiêu?",
        senderType: "guest",
        senderName: "Nguyễn Thị Lan",
        createdAt: "2026-06-07T14:00:00Z",
      },
      {
        id: "m4",
        content: "Chào bạn, học phí là 1,200,000 VND/tháng. Bạn có muốn đăng ký không?",
        senderType: "staff",
        senderName: "Admin NUEDU",
        createdAt: "2026-06-07T14:05:00Z",
      },
      {
        id: "m5",
        content: "Cảm ơn bạn đã trả lời!",
        senderType: "guest",
        senderName: "Nguyễn Thị Lan",
        createdAt: "2026-06-07T14:06:00Z",
      },
    ],
  },
  {
    id: "conv-3",
    guestName: "Trần Văn Mạnh",
    status: "closed",
    lastMessage: "Đã giải quyết",
    unread: 0,
    createdAt: "2026-06-06T10:00:00Z",
    messages: [
      {
        id: "m6",
        content: "Tôi muốn hủy đăng ký",
        senderType: "guest",
        senderName: "Trần Văn Mạnh",
        createdAt: "2026-06-06T10:00:00Z",
      },
      {
        id: "m7",
        content: "Đã giải quyết",
        senderType: "staff",
        senderName: "Admin NUEDU",
        createdAt: "2026-06-06T10:15:00Z",
      },
    ],
  },
];

export function getAllConversations(): Conversation[] {
  return conversations;
}

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function sendMessage(
  conversationId: string,
  content: string,
  staffName: string
): Message | null {
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return null;
  const msg: Message = {
    id: "m" + Date.now(),
    content,
    senderType: "staff",
    senderName: staffName,
    createdAt: new Date().toISOString(),
  };
  conv.messages.push(msg);
  conv.lastMessage = content;
  conv.unread = 0;
  return msg;
}

export function closeConversation(id: string): boolean {
  const conv = conversations.find((c) => c.id === id);
  if (!conv) return false;
  conv.status = "closed";
  return true;
}

export function assignConversation(id: string, staffName: string): boolean {
  const conv = conversations.find((c) => c.id === id);
  if (!conv) return false;
  conv.status = "assigned";
  conv.assignedTo = staffName;
  return true;
}
