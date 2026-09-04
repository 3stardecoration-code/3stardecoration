"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // Pages with a dark/espresso hero background behind the header before scrolling:
  // - /services and all subpages (/services/*)
  // - /about and all subpages (/about/*)
  // - /contact and all subpages (/contact/*)
  // - /portfolio/* (project detail pages)
  const overHero =
    pathname.startsWith("/services") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/portfolio/");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Light (over hero, not scrolled) vs. inked (scrolled or non-hero pages).
  const light = overHero && !scrolled && !menuOpen;
  const ink = light ? "text-ivory" : "text-charcoal";
  const showWhiteLogo = light || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,padding] duration-500 ${scrolled && !menuOpen
        ? "bg-ivory/80 py-2.5 sm:py-5 shadow-[0_1px_0_rgba(23,19,15,0.06)] backdrop-blur-xl"
        : "bg-transparent py-6"
        }`}
      style={{ transitionTimingFunction: "var(--ease-lux)" }}
    >
      <div className="mx-auto flex w-full max-w-[82rem] items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className={`relative transition-[height,width] duration-500 ${scrolled && !menuOpen
            ? "h-11 w-[6rem] sm:h-12 sm:w-[6.8rem]"
            : "h-14 w-[7.5rem] sm:h-16 sm:w-[8.5rem]"
            }`}
          style={{ transitionTimingFunction: "var(--ease-lux)" }}
          aria-label="3 Star Decoration — home"
        >
          {/* Both logos occupy the same absolute position — only opacity changes */}
          <Logo
            variant="black"
            priority
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
            style={{ opacity: showWhiteLogo ? 0 : 1, transitionTimingFunction: "var(--ease-lux)" }}
          />
          <Logo
            variant="white"
            priority
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
            style={{ opacity: showWhiteLogo ? 1 : 0, transitionTimingFunction: "var(--ease-lux)" }}
          />
        </Link>

        <nav className={`hidden items-center gap-9 lg:flex ${ink}`}>
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative text-[0.82rem] font-medium tracking-wide"
              >
                {item.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-500 ${active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  style={{ transitionTimingFunction: "var(--ease-lux)" }}
                />
              </Link>
            );
          })}
          <Link
            href="/quote"
            className="rounded-full border border-current px-5 py-2 text-[0.82rem] font-medium tracking-wide transition-colors duration-300 hover:bg-accent hover:border-accent hover:text-ivory"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${menuOpen ? "text-ivory" : ink
            }`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
          />
          <span
            className={`block h-px w-6 bg-current transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
          />
        </button>
      </div>

      {/* Fullscreen mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-espresso text-ivory transition-[opacity,visibility] duration-500 lg:hidden ${menuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        style={{ transitionTimingFunction: "var(--ease-lux)" }}
      >
        <nav className="flex h-full flex-col justify-center gap-2 px-8">
          {[...NAV, { href: "/quote", label: "Get a Quote" }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-[family-name:var(--font-display)] text-4xl tracking-tight transition-transform duration-500"
              style={{
                transitionDelay: menuOpen ? `${120 + i * 60}ms` : "0ms",
                transform: menuOpen ? "translateY(0)" : "translateY(1rem)",
                opacity: menuOpen ? 1 : 0,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
