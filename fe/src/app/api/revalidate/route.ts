// Webhook target from BE — swap revalidatePath calls when ISR is real
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-revalidate-token");
  if (token !== process.env.NEXT_REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    paths?: string[];
    slug?: string;
  };

  const paths = body.paths ?? [];
  for (const path of paths) {
    revalidatePath(`/vi${path}`);
    revalidatePath(`/en${path}`);
  }

  if (body.slug) {
    revalidatePath(`/vi/news/${body.slug}`);
    revalidatePath(`/en/news/${body.slug}`);
  }

  return NextResponse.json({ revalidated: true, paths });
}
