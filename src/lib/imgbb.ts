/**
 * Client-side image upload via imgBB. Used on Register (profile picture) and
 * Add Campaign (cover image). Needs NEXT_PUBLIC_IMGBB_API_KEY.
 */

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

export function hasImgbbKey(): boolean {
  return IMGBB_KEY.length > 0;
}

/** A deterministic generated-avatar URL, used as a fallback when no upload. */
export function generatedAvatar(name: string): string {
  const seed = encodeURIComponent(name || "member");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}

/**
 * Uploads a File to imgBB and resolves to the hosted image URL. Throws on
 * failure so callers can decide on a fallback.
 */
export async function uploadToImgbb(file: File): Promise<string> {
  if (!IMGBB_KEY) {
    throw new Error("Image upload is not configured (missing imgBB API key).");
  }
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.url) {
    throw new Error(json?.error?.message || "Image upload failed. Please try again.");
  }
  return json.data.url as string;
}
