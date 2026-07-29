import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/**
 * The real 3 Star Decoration brand mark. Background removed (transparent
 * PNG, public/brand/logo.png) — the black plate reads clearly on both light
 * and dark surfaces, so no separate light/dark variant is needed.
 */
export function Logo({ className, priority }: Props) {
  return (
    <Image
      src="/brand/logo.png"
      alt="3 Star Decoration"
      width={900}
      height={408}
      priority={priority}
      className={className}
      style={{ width: "auto", height: "100%" }}
    />
  );
}
