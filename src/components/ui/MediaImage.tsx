"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset } from "@/lib/domain";

type Props = {
  asset: Pick<MediaAsset, "secure_url" | "alt_text" | "width" | "height" | "dominant_color">;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Cover the parent (parent must be positioned + sized). */
  fill?: boolean;
};

/**
 * Renders a MediaAsset with a dominant-colour backdrop and a soft fade-in so
 * images never pop. Reads only domain fields, so swapping mock → Cloudinary
 * assets needs no change here.
 */
export function MediaImage({ asset, sizes, className, imgClassName, priority, fill = true }: Props) {
  const [loaded, setLoaded] = useState(false);
  const alt = asset.alt_text ?? "";

  // In fill mode, do NOT set width/height here — next/image supplies
  // width:100%/height:100% for fill, and passing undefined would clobber them.
  const imgStyle: React.CSSProperties = fill
    ? { objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.9s var(--ease-lux)" }
    : {
        objectFit: "cover",
        width: "100%",
        height: "auto",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.9s var(--ease-lux)",
      };

  return (
    <div
      className={className}
      style={{
        position: fill ? "absolute" : "relative",
        inset: fill ? 0 : undefined,
        overflow: "hidden",
        backgroundColor: asset.dominant_color ?? "var(--color-line)",
      }}
    >
      <Image
        src={asset.secure_url}
        alt={alt}
        {...(fill
          ? { fill: true }
          : { width: asset.width ?? 1600, height: asset.height ?? 1067 })}
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={imgClassName}
        style={imgStyle}
      />
    </div>
  );
}
