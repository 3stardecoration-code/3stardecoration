import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import type { MediaAsset } from "@/lib/domain";

type Props = { before: MediaAsset; after: MediaAsset };

export function TransformationShowcase({ before, after }: Props) {
  return (
    <section className="py-section">
      <Container className="mb-14">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The Transformation</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl">Same room. Different world.</h2>
        </Reveal>
      </Container>
      <Reveal y={40}>
        <Container>
          <BeforeAfterSlider before={before} after={after} />
        </Container>
      </Reveal>
    </section>
  );
}
