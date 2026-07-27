import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeading } from "@/components/home/SectionHeading";
import type { Project, MediaAsset, Category } from "@/lib/domain";

export type ResolvedProject = {
  project: Project;
  cover?: MediaAsset;
  category?: Category;
};

export function FeaturedWorks({ items }: { items: ResolvedProject[] }) {
  return (
    <section className="py-section">
      <Container>
        <SectionHeading
          eyebrow="Selected Work"
          title="A few of our favourite celebrations"
          intro="Every event is designed from a blank canvas — styled, built, and finished down to the last stem."
          link={{ href: "/portfolio", label: "View full portfolio" }}
        />

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
          {items.map(({ project, cover, category }, i) => (
            <Reveal
              key={project.id}
              delay={i * 0.08}
              className={i === 1 ? "md:mt-20" : ""}
            >
              <ProjectCard
                project={project}
                cover={cover}
                category={category}
                sizes="(min-width: 768px) 30vw, 90vw"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
