type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  // If it's already a full Cloudinary delivery URL, inject width & format/quality transformations
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    const params = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`].join(",");
    // Inject params right after /image/upload/ if not already parameterized
    if (/\/image\/upload\/(?!f_auto|w_|q_)/.test(src)) {
      return src.replace("/image/upload/", `/image/upload/${params}/`);
    }
    return src;
  }

  // Absolute non-Cloudinary URLs (e.g. YouTube thumbnails) pass through unchanged.
  if (/^https?:\/\//.test(src)) return src;
  // Root-relative local paths (files under /public, mock fixtures) pass through.
  if (src.startsWith("/")) return src;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`].join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${params}/${src}`;
}
