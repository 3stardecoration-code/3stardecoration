"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addMediaAsset } from "@/app/actions/admin/media";

type SignResponse = { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resource_type: "image" | "video";
};

type QueueItem = {
  id: string;
  file: File;
  altText: string;
  preview: string;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  error?: string;
};

const CONCURRENCY = 4;
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.85;
// Skip compressing files already smaller than this — nothing to gain.
const SKIP_COMPRESS_UNDER_BYTES = 400_000;

/**
 * Downscales + re-encodes a photo in the browser before upload. A modern
 * phone photo can be 5-15MB at full resolution; a website never needs more
 * than ~2400px on the long edge, so this is the single biggest lever for
 * "uploads feel slow" — it shrinks what actually has to travel over the wire.
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < SKIP_COMPRESS_UNDER_BYTES) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Any failure (unsupported format, decode error) — fall back to the original file.
    return file;
  }
}

/** "wedding-hall_03.jpg" -> "Wedding hall 03" (optionally prefixed with the parent folder name). */
function humanize(file: File): string {
  const relPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  const folder = relPath?.includes("/") ? relPath.split("/").slice(-2, -1)[0] : null;
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  const label = base.charAt(0).toUpperCase() + base.slice(1);
  return folder ? `${folder} — ${label}` : label;
}

export function AddMediaForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const picked = [...fileList].filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    const items: QueueItem[] = picked.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
      altText: humanize(file),
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setQueue((q) => [...q, ...items]);
  }

  function removeItem(id: string) {
    setQueue((q) => q.filter((item) => item.id !== id));
  }

  function updateAlt(id: string, altText: string) {
    setQueue((q) => q.map((item) => (item.id === id ? { ...item, altText } : item)));
  }

  function reset() {
    setQueue([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  }

  async function uploadOne(sign: SignResponse, item: QueueItem) {
    setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "compressing" } : i)));
    try {
      const uploadFile = await compressImage(item.file);
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));

      const uploadForm = new FormData();
      uploadForm.append("file", uploadFile);
      uploadForm.append("api_key", sign.apiKey);
      uploadForm.append("timestamp", String(sign.timestamp));
      uploadForm.append("signature", sign.signature);
      uploadForm.append("folder", sign.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
        method: "POST",
        body: uploadForm,
      });
      if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed.");
      const uploaded: CloudinaryUploadResponse = await uploadRes.json();

      const res = await addMediaAsset({
        secure_url: uploaded.secure_url,
        alt_text: item.altText.trim() || item.file.name,
        public_id: uploaded.public_id,
        thumbnail_url: uploaded.secure_url,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        format: uploaded.format ?? null,
        file_size: uploaded.bytes ?? null,
        source: uploaded.resource_type === "video" ? "cloudinary_video" : "cloudinary_image",
      });
      if (!res.ok) throw new Error(res.error);

      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "done" } : i)));
    } catch (err) {
      setQueue((q) =>
        q.map((i) =>
          i.id === item.id
            ? { ...i, status: "error", error: err instanceof Error ? err.message : "Failed" }
            : i,
        ),
      );
    }
  }

  async function handleUploadAll() {
    const pending = queue.filter((i) => i.status === "pending" || i.status === "error");
    if (pending.length === 0) return;
    setError(null);
    setRunning(true);
    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Could not sign the upload. Is Cloudinary configured?");
      const sign: SignResponse = await signRes.json();

      let cursor = 0;
      async function worker() {
        while (cursor < pending.length) {
          const item = pending[cursor];
          cursor += 1;
          await uploadOne(sign, item);
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  const doneCount = queue.filter((i) => i.status === "done").length;
  const errorCount = queue.filter((i) => i.status === "error").length;
  const allDone = queue.length > 0 && doneCount === queue.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (open) reset();
        }}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        {open ? "Cancel" : "+ Add photos"}
      </button>

      {open && (
        <div className="mt-4 max-w-2xl space-y-4 rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose photos or videos
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </label>
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose a whole folder
              <input
                ref={folderInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                // Non-standard attributes that enable folder (incl. subfolder) selection in Chrome/Edge/Safari.
                {...{ webkitdirectory: "", directory: "" }}
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </label>
            <p className="self-center text-xs text-gray-400">
              Picking a folder grabs every photo in it and its subfolders.
            </p>
          </div>

          {queue.length > 0 && (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                  <input
                    value={item.altText}
                    onChange={(e) => updateAlt(item.id, e.target.value)}
                    disabled={item.status === "compressing" || item.status === "uploading" || item.status === "done"}
                    className="input flex-1 py-1.5 text-sm"
                  />
                  <span className="w-20 shrink-0 text-right text-xs">
                    {item.status === "pending" && <span className="text-gray-400">Waiting</span>}
                    {item.status === "compressing" && <span className="text-gray-500">Optimizing…</span>}
                    {item.status === "uploading" && <span className="text-gray-500">Uploading…</span>}
                    {item.status === "done" && <span className="text-emerald-600">Uploaded</span>}
                    {item.status === "error" && <span title={item.error} className="text-red-600">Failed</span>}
                  </span>
                  {item.status !== "compressing" && item.status !== "uploading" && item.status !== "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 text-xs text-gray-400 hover:text-gray-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {queue.length > 0 && (
            <p className="text-xs text-gray-500">
              {doneCount}/{queue.length} uploaded{errorCount > 0 ? ` — ${errorCount} failed` : ""}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={running || queue.length === 0 || allDone}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {running
                ? "Uploading…"
                : errorCount > 0
                  ? `Retry ${errorCount} failed`
                  : `Upload ${queue.length || ""} to library`}
            </button>
            {allDone && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
