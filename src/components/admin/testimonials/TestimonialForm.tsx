"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateTestimonial, trashTestimonial } from "@/app/actions/admin/testimonials";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaAsset, Testimonial, WorkflowStatus } from "@/lib/domain";

const WORKFLOW_OPTIONS: WorkflowStatus[] = ["draft", "published", "unpublished"];
const RATINGS = [5, 4, 3, 2, 1];

export function TestimonialForm({ testimonial, mediaAssets }: { testimonial: Testimonial; mediaAssets: MediaAsset[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [authorName, setAuthorName] = useState(testimonial.author_name);
  const [eventType, setEventType] = useState(testimonial.event_type ?? "");
  const [quote, setQuote] = useState(testimonial.quote);
  const [rating, setRating] = useState(testimonial.rating ?? 5);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(testimonial.workflow_status);
  const [mediaId, setMediaId] = useState<string | null>(testimonial.media_asset_id);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateTestimonial(testimonial.id, {
        author_name: authorName,
        event_type: eventType || null,
        quote,
        rating,
        workflow_status: workflowStatus,
        media_asset_id: mediaId,
      });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  function handleTrash() {
    if (!window.confirm(`Move this testimonial to Trash?`)) return;
    startTransition(async () => {
      await trashTestimonial(testimonial.id);
      router.push("/admin/testimonials");
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/testimonials" className="text-sm text-gray-500 hover:text-gray-900">
        ← All testimonials
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">{testimonial.author_name}</h1>

      <div className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Author name</span>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Event type</span>
            <input value={eventType} onChange={(e) => setEventType(e.target.value)} className="input mt-1.5" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Quote</span>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={4} className="input mt-1.5" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="input mt-1.5"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r} star{r === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
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

        <MediaPicker assets={mediaAssets} selectedId={mediaId} onSelect={setMediaId} label="Avatar (optional)" />

        <button
          type="button"
          onClick={handleTrash}
          className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
        >
          Move to Trash
        </button>
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
