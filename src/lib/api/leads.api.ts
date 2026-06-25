const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface LeadForm {
  fullName: string;
  address: string;
  phone: string;
  content: string;
}

export async function submitLead(data: LeadForm): Promise<void> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Submit failed');
}
