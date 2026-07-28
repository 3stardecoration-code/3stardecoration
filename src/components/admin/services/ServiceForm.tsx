"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateService, trashService } from "@/app/actions/admin/services";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaAsset, Service, WorkflowStatus } from "@/lib/domain";

const WORKFLOW_OPTIONS: WorkflowStatus[] = ["draft", "published", "unpublished"];

export function ServiceForm({ service, mediaAssets }: { service: Service; mediaAssets: MediaAsset[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(service.title);
  const [slug, setSlug] = useState(service.slug);
  const [shortDescription, setShortDescription] = useState(service.short_description ?? "");
  const [description, setDescription] = useState(service.description ?? "");
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(service.workflow_status);
  const [mediaId, setMediaId] = useState<string | null>(service.media_asset_id);
  const [robotsIndex, setRobotsIndex] = useState(service.robots_index);
  const [robotsFollow, setRobotsFollow] = useState(service.robots_follow);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateService(service.id, {
        title,
        slug,
        short_description: shortDescription || null,
        description: description || null,
        workflow_status: workflowStatus,
        media_asset_id: mediaId,
        og_media_asset_id: mediaId,
        robots_index: robotsIndex,
        robots_follow: robotsFollow,
      });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  function handleTrash() {
    if (!window.confirm(`Move "${service.title}" to Trash?`)) return;
    startTransition(async () => {
      await trashService(service.id);
      router.push("/admin/services");
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/services" className="text-sm text-gray-500 hover:text-gray-900">
          ← All services
        </Link>
        {service.workflow_status === "published" && (
          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            View live →
          </Link>
        )}
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">{service.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1.5" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Slug</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input mt-1.5 font-mono text-sm" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Short description</span>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              className="input mt-1.5"
              placeholder="Shown on the services grid card."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input mt-1.5"
              placeholder="Full text shown on the service detail page."
            />
          </label>

          <MediaPicker assets={mediaAssets} selectedId={mediaId} onSelect={setMediaId} label="Cover image" />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Publishing</p>
            <label className="mt-3 block">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                value={workflowStatus}
                onChange={(e) => setWorkflowStatus(e.target.value as WorkflowStatus)}
                className="input mt-1.5 capitalize"
              >
                {WORKFLOW_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
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
