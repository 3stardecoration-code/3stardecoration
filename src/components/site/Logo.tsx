import Image from "next/image";
import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  /** 'black' | 'white' to pick between the dark mark and light mark. Defaults to 'black'. */
  variant?: "black" | "white";
};

/**
 * The 3 Star Decoration brand mark.
 * Uses built-in PNGs: /brand/logo-black.png (dark contexts) and
 * /brand/logo-white.png (light-on-dark contexts).
 */
export function Logo({ className, style, priority, variant = "black" }: Props) {
  const src = variant === "white" ? "/brand/logo-white.png" : "/brand/logo-black.png";

  return (
    <Image
      src={src}
      alt="3 Star Decoration"
      width={420}
      height={222}
      priority={priority}
      className={className}
      style={style}
    />
  );
}
