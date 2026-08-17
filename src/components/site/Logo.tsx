import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
  /** Overrides the default mark — an admin-uploaded logo from Settings, when one is set. */
  src?: string | null;
};

/**
 * The 3 Star Decoration brand mark. Defaults to the built-in transparent
 * PNG (public/brand/logo.png); admins can replace it from Admin → Settings
 * → Website logo without a code change.
 */
export function Logo({ className, priority, src }: Props) {
  return (
    <Image
      src={src || "/brand/logo.png"}
      alt="3 Star Decoration"
      width={900}
      height={408}
      priority={priority}
      className={className}
    />
  );
}
