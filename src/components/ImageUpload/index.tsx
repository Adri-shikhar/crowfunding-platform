"use client";

import { useRef, useState } from "react";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import { cx } from "@/lib/utils";
import { hasImgbbKey, uploadToImgbb } from "@/lib/imgbb";
import { Spinner } from "@/components/ui";

/**
 * File picker with live preview that uploads to imgBB on selection. Reports the
 * hosted URL via `onChange`. When imgBB isn't configured it degrades gracefully:
 * it still previews the image and lets the parent fall back to a generated URL.
 */
export function ImageUpload({
  onChange,
  onUploadingChange,
  shape = "wide",
  label,
}: {
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  shape?: "circle" | "wide";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setNote(null);
    setPreview(URL.createObjectURL(file));

    if (!hasImgbbKey()) {
      setNote("Image hosting isn't configured — a generated image will be used.");
      onChange("");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadToImgbb(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      onChange("");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  const isCircle = shape === "circle";

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-semibold text-label">{label}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cx(
          "group relative flex items-center justify-center overflow-hidden border-2 border-dashed border-border-strong bg-surface-2 text-muted transition-colors hover:border-accent hover:text-accent",
          isCircle ? "h-24 w-24 rounded-full" : "aspect-[16/8] w-full rounded-2xl",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-3 text-center">
            {isCircle ? <FiImage className="text-xl" /> : <FiUploadCloud className="text-2xl" />}
            {!isCircle && (
              <span className="text-xs font-medium">Click to upload a cover image</span>
            )}
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <Spinner size={22} />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
      {note && !error && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}
