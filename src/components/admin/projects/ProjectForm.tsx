"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProject, trashProject, setProjectGallery } from "@/app/actions/admin/projects";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MediaMultiPicker } from "@/components/admin/MediaMultiPicker";
import type { Category, MediaAsset, Project, ProjectMedia, ProjectStatus, WorkflowStatus } from "@/lib/domain";

const WORKFLOW_OPTIONS: WorkflowStatus[] = ["draft", "published", "unpublished"];
const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ["upcoming", "ongoing", "completed"];

export function ProjectForm({
  project,
  gallery,
  categories,
  mediaAssets,
}: {
  project: Project;
  gallery: ProjectMedia[];
  categories: Category[];
  mediaAssets: MediaAsset[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [categoryId, setCategoryId] = useState(project.category_id);
  const [summary, setSummary] = useState(project.summary ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [clientName, setClientName] = useState(project.client_name ?? "");
  const [location, setLocation] = useState(project.location ?? "");
  const [eventDate, setEventDate] = useState(project.event_date ?? "");
  const [completionDate, setCompletionDate] = useState(project.completion_date ?? "");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(project.project_status);
  const [featured, setFeatured] = useState(project.featured_on_homepage);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(project.workflow_status);
  const [coverId, setCoverId] = useState<string | null>(project.cover_media_asset_id);
  const [robotsIndex, setRobotsIndex] = useState(project.robots_index);
  const [robotsFollow, setRobotsFollow] = useState(project.robots_follow);
  const [galleryIds, setGalleryIds] = useState<string[]>(
    [...gallery].sort((a, b) => a.sort_order - b.sort_order).map((m) => m.media_asset_id),
  );

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const [res, galleryRes] = await Promise.all([
        updateProject(project.id, {
          title,
          slug,
          category_id: categoryId,
          summary: summary || null,
          description: description || null,
          client_name: clientName || null,
          location: location || null,
          event_date: eventDate || null,
          completion_date: completionDate || null,
          project_status: projectStatus,
          featured_on_homepage: featured,
          workflow_status: workflowStatus,
          cover_media_asset_id: coverId,
          og_media_asset_id: coverId,
          robots_index: robotsIndex,
          robots_follow: robotsFollow,
        }),
        setProjectGallery(project.id, galleryIds),
      ]);
      if (res.ok && galleryRes.ok) setSaved(true);
      else setError(!res.ok ? res.error : !galleryRes.ok ? galleryRes.error : "Something went wrong.");
    });
  }

  function handleTrash() {
    if (!window.confirm(`Move "${project.title}" to Trash? You can restore it later.`)) return;
    startTransition(async () => {
      await trashProject(project.id);
      router.push("/admin/portfolio");
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/portfolio" className="text-sm text-gray-500 hover:text-gray-900">
          ← All projects
        </Link>
        <Link
          href={`/admin/portfolio/${project.id}/preview`}
          target="_blank"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Preview →
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">{project.title || "Untitled project"}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </Field>
            <Field label="Slug">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input font-mono text-sm" />
            </Field>
          </div>

          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Summary">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="input"
              placeholder="A one-line summary shown on the portfolio card and detail hero."
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input"
              placeholder="Full story shown on the project detail page. Basic HTML (<p>, <em>) is supported."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Client name (optional)">
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="input" />
            </Field>
            <Field label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
            </Field>
            <Field label="Event date">
              <input
                type="date"
                value={eventDate ?? ""}
                onChange={(e) => setEventDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Completion date">
              <input
                type="date"
                value={completionDate ?? ""}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <MediaPicker assets={mediaAssets} selectedId={coverId} onSelect={setCoverId} />

          <div>
            <MediaMultiPicker
              assets={mediaAssets}
              selectedIds={galleryIds}
              onChange={setGalleryIds}
              label="Gallery photos"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Shown in the photo gallery on this project&apos;s detail page.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Publishing</p>
            <div className="mt-3 space-y-4">
              <Field label="Status">
                <select
                  value={workflowStatus}
                  onChange={(e) => setWorkflowStatus(e.target.value as WorkflowStatus)}
                  className="input capitalize"
                >
                  {WORKFLOW_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Event stage">
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                  className="input capitalize"
                >
                  {PROJECT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Feature on homepage
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">SEO</p>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={robotsIndex}
                  onChange={(e) => setRobotsIndex(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Allow search engines to index
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={robotsFollow}
                  onChange={(e) => setRobotsFollow(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Allow search engines to follow links
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTrash}
            className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Move to Trash
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="sticky bottom-0 mt-8 flex items-center gap-4 border-t border-gray-200 bg-white/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && !isPending && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
