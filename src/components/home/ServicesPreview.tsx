import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/home/SectionHeading";
import type { Service } from "@/lib/domain";

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <section className="bg-porcelain py-section">
      <Container>
        <SectionHeading
          eyebrow="What we create"
          title="Design for every occasion"
          intro="From intimate ceremonies to grand stages, we bring a single, considered aesthetic to every kind of event."
          link={{ href: "/services", label: "All services" }}
        />

        <ul className="mt-14 border-t border-line">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href="/services"
                className="group flex items-center justify-between gap-6 border-b border-line py-7 transition-colors"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-accent opacity-0 transition-all duration-300 group-hover:opacity-100" aria-hidden>
                    ✦
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                    {service.title}
                  </h3>
                </div>
                <p className="hidden max-w-xs text-right text-sm text-stone sm:block">
                  {service.short_description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
