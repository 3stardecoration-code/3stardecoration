import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { ProjectHero } from "@/components/portfolio/ProjectHero";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import type { MediaAsset } from "@/lib/domain";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "In progress",
  completed: "Completed",
};

// Admin-only preview: renders the SAME components the public detail page uses,
// but reads by id (not gated on workflow_status='published'), so drafts can be
// previewed before they're live. Spec §7.2: dynamic, authenticated, no-store.
export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDataService();
  const res = await db.projects.getById(id);
  if (!res) notFound();
  const { project, media } = res;

  const categories = await db.categories.list();
  const category = categories.find((c) => c.id === project.category_id);

  const ids = new Set<string>();
  if (project.cover_media_asset_id) ids.add(project.cover_media_asset_id);
  media.forEach((m) => ids.add(m.media_asset_id));
  const assets = await db.media.getManyByIds([...ids]);

  const cover = project.cover_media_asset_id ? assets[project.cover_media_asset_id] : undefined;
  const galleryImages: MediaAsset[] = media
    .map((m) => assets[m.media_asset_id])
    .filter((m): m is MediaAsset => Boolean(m));

  const heroMeta = [project.event_date, project.location, STATUS_LABEL[project.project_status]].filter(
    (x): x is string => Boolean(x),
  );

  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-400 px-6 py-2.5 text-sm font-medium text-amber-950">
        <span>
          Preview mode — this project is <strong className="capitalize">{project.workflow_status}</strong> and
          may not be visible on the live site.
        </span>
      </div>

      <ProjectHero
        title={project.title}
        category={category?.name ?? project.event_type ?? "Event"}
        meta={heroMeta}
        cover={cover}
      />

      <section className="py-section">
        <Container className="max-w-2xl">
          {project.summary && <p className="display text-3xl leading-tight sm:text-4xl">{project.summary}</p>}
          {project.description && (
            // sanitized server-side on write (spec §12); admin-only preview besides.
            <div
              className="mt-8 space-y-5 text-[0.98rem] leading-relaxed text-stone [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </Container>
      </section>

      {galleryImages.length > 0 && (
        <section className="pb-section">
          <Container>
            <ProjectGallery images={galleryImages} />
          </Container>
        </section>
      )}
    </div>
  );
}
