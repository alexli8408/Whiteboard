import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, contentType } = await req.json();
  const key = `uploads/${session.user.id}/${randomUUID()}-${fileName}`;
  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({
    uploadUrl,
    fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  });
}
