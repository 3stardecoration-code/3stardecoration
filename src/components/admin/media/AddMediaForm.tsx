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

export function AddMediaForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<"idle" | "uploading" | "saving">("idle");

  function reset() {
    setFile(null);
    setPreview(null);
    setAltText("");
    setError(null);
    setProgress("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setPreview(picked ? URL.createObjectURL(picked) : null);
  }

  async function handleUpload() {
    if (!file || !altText.trim()) {
      setError("Choose a photo and describe it before uploading.");
      return;
    }
    setError(null);
    setProgress("uploading");
    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Could not sign the upload. Is Cloudinary configured?");
      const sign: SignResponse = await signRes.json();

      const uploadForm = new FormData();
      uploadForm.append("file", file);
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

      setProgress("saving");
      const res = await addMediaAsset({
        secure_url: uploaded.secure_url,
        alt_text: altText.trim(),
        public_id: uploaded.public_id,
        thumbnail_url: uploaded.secure_url,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        format: uploaded.format ?? null,
        file_size: uploaded.bytes ?? null,
        source: uploaded.resource_type === "video" ? "cloudinary_video" : "cloudinary_image",
      });
      if (!res.ok) throw new Error(res.error);

      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setProgress("idle");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        {open ? "Cancel" : "+ Add photo"}
      </button>

      {open && (
        <div className="mt-4 max-w-lg space-y-3 rounded-xl border border-gray-200 p-4">
          <label
            htmlFor="media-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center hover:border-gray-300"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">Choose a photo or video</span>
                <span className="text-xs text-gray-400">JPG, PNG, or MP4</span>
              </>
            )}
            <input
              id="media-file"
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the photo — e.g. Wedding stage with floral backdrop"
            className="input"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleUpload}
            disabled={progress !== "idle" || !file}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {progress === "uploading" ? "Uploading…" : progress === "saving" ? "Saving…" : "Upload to library"}
          </button>
        </div>
      )}
    </div>
  );
}
