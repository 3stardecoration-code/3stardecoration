"use client";

import { useState, useTransition } from "react";
import { updateAboutPage } from "@/app/actions/admin/about";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { AboutPageContent, AboutProcessStep, AboutStat, MediaAsset } from "@/lib/domain";

export function AboutPageForm({
  content,
  mediaAssets,
}: {
  content: AboutPageContent;
  mediaAssets: MediaAsset[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [heroEyebrow, setHeroEyebrow] = useState(content.hero_eyebrow);
  const [heroTitle, setHeroTitle] = useState(content.hero_title);
  const [heroDescription, setHeroDescription] = useState(content.hero_description);

  const [storyEyebrow, setStoryEyebrow] = useState(content.story_eyebrow);
  const [storyTitle, setStoryTitle] = useState(content.story_title);
  const [storyBody, setStoryBody] = useState(content.story_body);
  const [storyImageId, setStoryImageId] = useState<string | null>(content.story_image_asset_id);
  const [storyBadgeValue, setStoryBadgeValue] = useState(content.story_badge_value);
  const [storyBadgeLabel, setStoryBadgeLabel] = useState(content.story_badge_label);

  const [valuesText, setValuesText] = useState(content.values.join(", "));

  const [statsEyebrow, setStatsEyebrow] = useState(content.stats_eyebrow);
  const [statsTitle, setStatsTitle] = useState(content.stats_title);
  const [stats, setStats] = useState<AboutStat[]>(content.stats);

  const [processEyebrow, setProcessEyebrow] = useState(content.process_eyebrow);
  const [processTitle, setProcessTitle] = useState(content.process_title);
  const [processDescription, setProcessDescription] = useState(content.process_description);
  const [steps, setSteps] = useState<AboutProcessStep[]>(content.process_steps);

  function updateStat(index: number, patch: Partial<AboutStat>) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateStep(index: number, patch: Partial<AboutProcessStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateAboutPage({
        hero_eyebrow: heroEyebrow,
        hero_title: heroTitle,
        hero_description: heroDescription,
        story_eyebrow: storyEyebrow,
        story_title: storyTitle,
        story_body: storyBody,
        story_image_asset_id: storyImageId,
        story_badge_value: storyBadgeValue,
        story_badge_label: storyBadgeLabel,
        values: valuesText
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        stats_eyebrow: statsEyebrow,
        stats_title: statsTitle,
        stats,
        process_eyebrow: processEyebrow,
        process_title: processTitle,
        process_description: processDescription,
        process_steps: steps,
      });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Hero</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Eyebrow</span>
            <input value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)} className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Headline</span>
            <textarea
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              rows={2}
              className="input mt-1.5"
            />
            <p className="mt-1 text-xs text-gray-400">Each line becomes its own line in the headline.</p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              rows={3}
              className="input mt-1.5"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Our story</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Eyebrow</span>
              <input
                value={storyEyebrow}
                onChange={(e) => setStoryEyebrow(e.target.value)}
                className="input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="input mt-1.5" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Story text</span>
            <textarea
              value={storyBody}
              onChange={(e) => setStoryBody(e.target.value)}
              rows={8}
              className="input mt-1.5"
            />
            <p className="mt-1 text-xs text-gray-400">Leave a blank line between paragraphs.</p>
          </label>
          <MediaPicker assets={mediaAssets} selectedId={storyImageId} onSelect={setStoryImageId} label="Story photo" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Badge value</span>
              <input
                value={storyBadgeValue}
                onChange={(e) => setStoryBadgeValue(e.target.value)}
                placeholder="e.g. 10+"
                className="input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Badge label</span>
              <input
                value={storyBadgeLabel}
                onChange={(e) => setStoryBadgeLabel(e.target.value)}
                placeholder="e.g. Years of craft"
                className="input mt-1.5"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Values</p>
        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Value pills</span>
            <input
              value={valuesText}
              onChange={(e) => setValuesText(e.target.value)}
              placeholder="Bespoke design, On-time delivery, …"
              className="input mt-1.5"
            />
            <p className="mt-1 text-xs text-gray-400">Comma-separated.</p>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Stats</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Eyebrow</span>
              <input
                value={statsEyebrow}
                onChange={(e) => setStatsEyebrow(e.target.value)}
                className="input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input value={statsTitle} onChange={(e) => setStatsTitle(e.target.value)} className="input mt-1.5" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-400">Stat {i + 1}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs text-gray-500">Number</span>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => updateStat(i, { value: Number(e.target.value) || 0 })}
                      className="input mt-1 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500">Suffix</span>
                    <input
                      value={stat.suffix}
                      onChange={(e) => updateStat(i, { suffix: e.target.value })}
                      placeholder="+ or %"
                      className="input mt-1 text-sm"
                    />
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="text-xs text-gray-500">Label</span>
                  <input
                    value={stat.label}
                    onChange={(e) => updateStat(i, { label: e.target.value })}
                    className="input mt-1 text-sm"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs text-gray-500">Sublabel</span>
                  <input
                    value={stat.sublabel}
                    onChange={(e) => updateStat(i, { sublabel: e.target.value })}
                    className="input mt-1 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">How we work</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Eyebrow</span>
              <input
                value={processEyebrow}
                onChange={(e) => setProcessEyebrow(e.target.value)}
                className="input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                value={processTitle}
                onChange={(e) => setProcessTitle(e.target.value)}
                className="input mt-1.5"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Intro</span>
            <textarea
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
              rows={2}
              className="input mt-1.5"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-400">Step {String(i + 1).padStart(2, "0")}</p>
                <label className="mt-3 block">
                  <span className="text-xs text-gray-500">Title</span>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    className="input mt-1 text-sm"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs text-gray-500">Description</span>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, { description: e.target.value })}
                    rows={3}
                    className="input mt-1 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-gray-200 bg-white/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && !isPending && <span className="text-sm text-emerald-600">Saved — live on the About page</span>}
      </div>
    </div>
  );
}
