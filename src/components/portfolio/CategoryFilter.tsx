import Link from "next/link";
import type { Category } from "@/lib/domain";

type Props = {
  categories: Category[];
  /** Currently active category slug, or undefined for "All". */
  active?: string;
};

/**
 * URL-driven category filter (SEO-friendly). Each pill is a real link to
 * /portfolio?category=<slug>, so filtered views are crawlable and shareable.
 */
export function CategoryFilter({ categories, active }: Props) {
  const pills = [{ name: "All", slug: undefined as string | undefined }, ...categories];

  return (
    <div className="scrollbar-none -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-2 sm:flex-wrap">
        {pills.map((c) => {
          const isActive = c.slug === active || (!c.slug && !active);
          const href = c.slug ? `/portfolio?category=${c.slug}` : "/portfolio";
          return (
            <li key={c.slug ?? "all"}>
              <Link
                href={href}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={`inline-block rounded-full border px-5 py-2 text-[0.8rem] font-medium tracking-wide transition-colors duration-300 ${
                  isActive
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-stone hover:border-charcoal hover:text-charcoal"
                }`}
                style={{ transitionTimingFunction: "var(--ease-lux)" }}
              >
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
