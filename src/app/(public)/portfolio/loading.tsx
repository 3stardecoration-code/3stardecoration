import { Container } from "@/components/ui/Container";

const RATIOS = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[3/2]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[3/2]",
];

export default function PortfolioLoading() {
  return (
    <div className="pt-32 pb-section sm:pt-36" aria-busy="true" aria-label="Loading portfolio">
      <Container>
        <div className="h-12 w-56 animate-pulse rounded bg-line sm:h-16 sm:w-72" />
        <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-line/70" />

        <div className="mt-12 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-line" />
          ))}
        </div>

        <div className="mt-14 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {RATIOS.map((r, i) => (
            <div key={i} className={`mb-6 break-inside-avoid rounded bg-line ${r} animate-pulse`} />
          ))}
        </div>
      </Container>
    </div>
  );
}
