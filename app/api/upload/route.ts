import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await requireAdmin())) {
          throw new Error("Not authorized to upload.");
        }
        return {
          allowedContentTypes: [
            "image/*",
            "application/pdf",
            "video/*",
            "video/quicktime",
            "video/mp4",
            "video/webm",
          ],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // no webhook processing needed
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
