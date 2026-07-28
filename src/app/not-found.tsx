import Link from "next/link";

// Root-level (outside the (public) route group) so it also serves as the
// boundary for notFound() calls from /portfolio/[slug] and /services/[slug].
// Self-contained chrome — the (public) layout's header/footer don't wrap this.
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-ivory px-6 text-center">
      <Link
        href="/"
        className="mb-14 flex items-baseline gap-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-charcoal"
      >
        <span className="text-accent">✦</span>
        <span>
          3&nbsp;Star <span className="italic">Decoration</span>
        </span>
      </Link>

      <p className="eyebrow">404</p>
      <h1 className="display mt-5 text-5xl sm:text-6xl">This page hasn&apos;t been designed yet.</h1>
      <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-stone">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved. Let&apos;s get you
        back to something beautiful.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso"
        >
          Back to home
        </Link>
        <Link
          href="/portfolio"
          className="inline-flex items-center rounded-full border border-line px-7 py-3.5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal"
        >
          View our work
        </Link>
      </div>
    </div>
  );
}
