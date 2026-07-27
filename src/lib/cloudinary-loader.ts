type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  // Absolute URLs (already-hosted images, YouTube/Vimeo thumbnails) pass through unchanged.
  if (/^https?:\/\//.test(src)) return src;
  // Root-relative local paths (files under /public, mock fixtures used before
  // Cloudinary is wired) also pass through — they are not Cloudinary public IDs.
  if (src.startsWith("/")) return src;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`].join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${params}/${src}`;
}
