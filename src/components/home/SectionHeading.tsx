import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
  tone?: "light" | "dark";
  align?: "start" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  link,
  tone = "light",
  align = "start",
}: Props) {
  const muted = tone === "dark" ? "text-ivory/65" : "text-stone";
  const ink = tone === "dark" ? "text-ivory" : "text-charcoal";

  return (
    <Reveal
      className={`flex flex-col gap-5 ${
        align === "center" ? "items-center text-center" : ""
      } md:flex-row md:items-end md:justify-between`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={`display mt-4 text-4xl sm:text-5xl ${ink}`}>{title}</h2>
        {intro && <p className={`mt-5 max-w-md text-[0.95rem] leading-relaxed ${muted}`}>{intro}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium tracking-wide ${ink}`}
        >
          {link.label}
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </Link>
      )}
    </Reveal>
  );
}
