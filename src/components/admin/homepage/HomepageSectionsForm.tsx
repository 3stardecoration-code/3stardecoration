"use client";

import { useState, useTransition } from "react";
import { updateHomepageSection } from "@/app/actions/admin/homepage";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MediaMultiPicker } from "@/components/admin/MediaMultiPicker";
import type { HomepageSection, MediaAsset } from "@/lib/domain";

const SECTION_INFO: Record<string, { title: string; description: string }> = {
  hero: {
    title: "Hero",
    description: "The first thing every visitor sees — headline, tagline, and full-bleed photo. Customize the hero copy and background image here.",
  },
  crafting_moments: {
    title: "Heritage & Crafting Moments",
    description: "The signature heritage and value proposition strip directly below the hero. Customize the badge, headline, and accent copy.",
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
    description: "A Pinterest-style photo wall. Choose which photos appear, and drag them into the order you want.",
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

  // Hero section state
  const [heroEyebrow, setHeroEyebrow] = useState<string>(
    (section.config.eyebrow as string | undefined) ?? "3 Star Decoration",
  );
  const [heroTitle, setHeroTitle] = useState<string>(
    (section.config.title as string | undefined) ?? "Three decades of dedication.",
  );
  const [heroTitleHighlight, setHeroTitleHighlight] = useState<string>(
    (section.config.title_highlight as string | undefined) ?? "A legacy of celebration.",
  );
  const [heroSubtitle, setHeroSubtitle] = useState<string>(
    (section.config.subtitle as string | undefined) ?? "Weddings · Receptions · Every Occasion",
  );
  const [heroImageId, setHeroImageId] = useState<string | null>(
    (section.config.background_media_asset_id as string | undefined) ?? null,
  );

  // Crafting moments state
  const [craftingEyebrow, setCraftingEyebrow] = useState<string>(
    (section.config.eyebrow as string | undefined) ?? "Since 1989",
  );
  const [craftingTitle, setCraftingTitle] = useState<string>(
    (section.config.title as string | undefined) ?? "Decorating celebrations,",
  );
  const [craftingTitleHighlight, setCraftingTitleHighlight] = useState<string>(
    (section.config.title_highlight as string | undefined) ?? "Creating memories.",
  );

  // Other sections state
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
      config.background_media_asset_id = heroImageId;
      config.eyebrow = heroEyebrow;
      config.title = heroTitle;
      config.title_highlight = heroTitleHighlight;
      config.subtitle = heroSubtitle;
    } else if (section.section_key === "crafting_moments") {
      config.eyebrow = craftingEyebrow;
      config.title = craftingTitle;
      config.title_highlight = craftingTitleHighlight;
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
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
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Eyebrow
              </label>
              <input
                type="text"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                placeholder="3 Star Decoration"
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Small gold tag above headline.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Weddings · Receptions · Every Occasion"
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Category highlight below the divider.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Headline (Main)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Three decades of dedication."
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Primary headline text.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Headline (Accent / Italic)
              </label>
              <input
                type="text"
                value={heroTitleHighlight}
                onChange={(e) => setHeroTitleHighlight(e.target.value)}
                placeholder="A legacy of celebration."
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Highlighted in italic gold font.</p>
            </div>
          </div>

          <div className="pt-2">
            <MediaPicker
              assets={mediaAssets}
              selectedId={heroImageId}
              onSelect={setHeroImageId}
              label="Hero photo"
            />
            <p className="mt-2 text-xs text-gray-500">
              Leave unset to use the default placeholder photo.
            </p>
          </div>
        </div>
      )}

      {section.section_key === "crafting_moments" && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Eyebrow Badge
              </label>
              <input
                type="text"
                value={craftingEyebrow}
                onChange={(e) => setCraftingEyebrow(e.target.value)}
                placeholder="Since 1989"
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Heritage badge text (e.g. Since 1989).</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Headline (Main)
              </label>
              <input
                type="text"
                value={craftingTitle}
                onChange={(e) => setCraftingTitle(e.target.value)}
                placeholder="Decorating celebrations,"
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Main headline phrase.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Accent / Italic Text
              </label>
              <input
                type="text"
                value={craftingTitleHighlight}
                onChange={(e) => setCraftingTitleHighlight(e.target.value)}
                placeholder="Creating memories."
                className="input mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-400">Highlighted in italic gold font.</p>
            </div>
          </div>
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
