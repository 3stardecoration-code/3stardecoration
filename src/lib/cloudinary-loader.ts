type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  const params = ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`].join(",");

  // If it's already a full Cloudinary delivery URL, inject or replace width & format/quality transformations
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    const uploadIdx = src.indexOf("/image/upload/");
    if (uploadIdx !== -1) {
      const prefix = src.slice(0, uploadIdx + "/image/upload/".length);
      const rest = src.slice(uploadIdx + "/image/upload/".length);
      // If there are existing transformations (e.g. f_auto,q_auto,w_400/), replace them
      const transformMatch = rest.match(/^((?:[a-z]{1,3}_[^/]+|[^/]+,[^/]+)\/)(.*)$/);
      if (transformMatch && !/^v\d+\//.test(transformMatch[1])) {
        return `${prefix}${params}/${transformMatch[2]}`;
      }
      return `${prefix}${params}/${rest}`;
    }
  }

  // Absolute non-Cloudinary URLs (e.g. YouTube thumbnails) pass through unchanged.
  if (/^https?:\/\//.test(src)) return src;
  // Root-relative local paths (files under /public, mock fixtures) pass through.
  if (src.startsWith("/")) return src;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/${params}/${src}`;
}
