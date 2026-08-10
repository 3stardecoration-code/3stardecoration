"use client";

import { useState, useTransition } from "react";
import { updateHomepageSection } from "@/app/actions/admin/homepage";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MediaMultiPicker } from "@/components/admin/MediaMultiPicker";
import type { HomepageSection, MediaAsset } from "@/lib/domain";

const SECTION_INFO: Record<string, { title: string; description: string }> = {
  hero: {
    title: "Hero",
    description: "The first thing every visitor sees. Choose the two photos layered around your headline.",
  },
  featured_works: {
    title: "Featured Works",
    description: "Showcases your best portfolio pieces. Mark projects “Featured on homepage” from Portfolio to control which ones appear here.",
  },
  featured_services: {
    title: "Featured Services",
    description: "A preview of your services. Each service's image is managed from its own entry under Services.",
  },
  before_after: {
    title: "Before & After",
    description: "The interactive drag slider. Choose the bare-venue photo and the styled result.",
  },
  testimonials: {
    title: "Testimonials",
    description: "Client quotes shown over a background photo. Choose the background image.",
  },
  instagram: {
    title: "Instagram Wall",
    description: "A Pinterest-style photo wall. Choose which photos appear, in any order.",
  },
  quote_cta: {
    title: "Final Call to Action",
    description: "The closing section inviting visitors to get a quote.",
  },
};

export function HomepageSectionsForm({
  sections,
  mediaAssets,
}: {
  sections: HomepageSection[];
  mediaAssets: MediaAsset[];
}) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} mediaAssets={mediaAssets} />
      ))}
    </div>
  );
}

function SectionCard({ section, mediaAssets }: { section: HomepageSection; mediaAssets: MediaAsset[] }) {
  const info = SECTION_INFO[section.section_key] ?? { title: section.section_key, description: "" };
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEnabled, setIsEnabled] = useState(section.is_enabled);
  const heroStackIds = (section.config.media_asset_ids as string[] | undefined) ?? [];
  const [heroPhoto1, setHeroPhoto1] = useState<string | null>(heroStackIds[0] ?? null);
  const [heroPhoto2, setHeroPhoto2] = useState<string | null>(heroStackIds[1] ?? null);
  const [beforeId, setBeforeId] = useState<string | null>(
    (section.config.before_media_asset_id as string | undefined) ?? null,
  );
  const [afterId, setAfterId] = useState<string | null>(
    (section.config.after_media_asset_id as string | undefined) ?? null,
  );
  const [bgId, setBgId] = useState<string | null>(
    (section.config.background_media_asset_id as string | undefined) ?? null,
  );
  const [galleryIds, setGalleryIds] = useState<string[]>(
    (section.config.media_asset_ids as string[] | undefined) ?? [],
  );

  function save() {
    setError(null);
    setSaved(false);
    const config: Record<string, unknown> = {};
    if (section.section_key === "hero") {
      config.media_asset_ids = [heroPhoto1, heroPhoto2].filter((id): id is string => Boolean(id));
    } else if (section.section_key === "before_after") {
      config.before_media_asset_id = beforeId;
      config.after_media_asset_id = afterId;
    } else if (section.section_key === "testimonials") {
      config.background_media_asset_id = bgId;
    } else if (section.section_key === "instagram") {
      config.media_asset_ids = galleryIds;
    }

    startTransition(async () => {
      const res = await updateHomepageSection(section.id, { is_enabled: isEnabled, config });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-gray-900">{info.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{info.description}</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Show on homepage
        </label>
      </div>

      {section.section_key === "hero" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <MediaPicker assets={mediaAssets} selectedId={heroPhoto1} onSelect={setHeroPhoto1} label="Photo 1" />
          <MediaPicker assets={mediaAssets} selectedId={heroPhoto2} onSelect={setHeroPhoto2} label="Photo 2" />
        </div>
      )}

      {section.section_key === "before_after" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <MediaPicker assets={mediaAssets} selectedId={beforeId} onSelect={setBeforeId} label="Before image" />
          <MediaPicker assets={mediaAssets} selectedId={afterId} onSelect={setAfterId} label="After image" />
        </div>
      )}

      {section.section_key === "testimonials" && (
        <div className="mt-5">
          <MediaPicker assets={mediaAssets} selectedId={bgId} onSelect={setBgId} label="Background image" />
        </div>
      )}

      {section.section_key === "instagram" && (
        <div className="mt-5">
          <MediaMultiPicker assets={mediaAssets} selectedIds={galleryIds} onChange={setGalleryIds} label="Photos" />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && !isPending && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
    </div>
  );
}
