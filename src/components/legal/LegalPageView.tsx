import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { LegalPage } from "@/lib/domain";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <div className="pt-32 pb-section sm:pt-40">
      <Container>
        <Reveal className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-4 text-4xl sm:text-5xl">{page.title}</h1>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-stone">
            Last updated {formatDate(page.updated_at)}
          </p>

          {page.body && (
            // body is sanitized server-side on write (spec §12); trusted fixture/CMS HTML.
            <div
              className="prose-legal mt-12 space-y-5 text-[0.98rem] leading-relaxed text-stone [&_h2]:mt-10 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:text-charcoal [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          )}
        </Reveal>
      </Container>
    </div>
  );
}
