import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthService } from "@/lib/services";

/**
 * Signs a Cloudinary direct-upload request so the browser can upload straight
 * to Cloudinary without ever seeing the API secret. Admin-only.
 */
export async function POST() {
  const session = await getAuthService().getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured on the server." }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "3star-decoration";
  // Cloudinary signs the exact param string (alphabetical, excluding file/api_key/cloud_name/signature) + the API secret.
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
