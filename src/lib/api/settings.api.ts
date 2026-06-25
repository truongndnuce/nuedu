import { apiFetch } from "./client";

export async function getLeadRecipients(): Promise<string[]> {
  const res = await apiFetch<{ emails: string[] }>("/settings/lead-recipients");
  return res.emails;
}

export async function setLeadRecipients(emails: string[]): Promise<void> {
  await apiFetch("/settings/lead-recipients", {
    method: "PUT",
    body: JSON.stringify({ emails }),
  });
}
