"use client";

import { useMemo, useRef, useState } from "react";

export type SizeRow = { size: string; stock: string };
export type ImageRow = { url: string; alt: string; isPrimary: boolean };

function normalizeInitialSizes(json: string | undefined): SizeRow[] {
  try {
    const x = JSON.parse(json?.trim() || "[]");
    if (!Array.isArray(x) || x.length === 0) return [{ size: "", stock: "" }];
    return x.map((r) => {
      const stockNum = Number((r as { stock?: unknown }).stock);
      return {
        size: String((r as { size?: unknown }).size ?? ""),
        stock: Number.isFinite(stockNum) && stockNum > 0
          ? String(Math.max(0, Math.floor(stockNum)))
          : "",
      };
    });
  } catch {
    return [{ size: "", stock: "" }];
  }
}

function normalizeInitialImages(json: string | undefined): ImageRow[] {
  try {
    const x = JSON.parse(json?.trim() || "[]");
    if (!Array.isArray(x) || x.length === 0) {
      return [{ url: "", alt: "", isPrimary: true }];
    }
    const anyPrimary = x.some((r) => Boolean((r as { isPrimary?: unknown }).isPrimary));
    return x.map((r, i) => ({
      url: String((r as { url?: unknown }).url ?? ""),
      alt: String((r as { alt?: unknown }).alt ?? ""),
      isPrimary: Boolean((r as { isPrimary?: unknown }).isPrimary) || (!anyPrimary && i === 0),
    }));
  } catch {
    return [{ url: "", alt: "", isPrimary: true }];
  }
}

export function ProductSizesImagesEditor({
  sizesJson,
  imagesJson,
}: {
  sizesJson: string;
  imagesJson: string;
}) {
  const [sizes, setSizes] = useState<SizeRow[]>(() => normalizeInitialSizes(sizesJson));
  const [images, setImages] = useState<ImageRow[]>(() => normalizeInitialImages(imagesJson));
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sizesPayload = useMemo(() => {
    const rows = sizes
      .filter((r) => r.size.trim())
      .map((r) => {
        const n = Number.parseInt(r.stock, 10);
        return {
          size: r.size.trim(),
          stock: Number.isFinite(n) && n > 0 ? n : 0,
        };
      });
    return rows.length ? rows : [{ size: "ONE", stock: 0 }];
  }, [sizes]);

  const imagesPayload = useMemo(() => {
    let rows = images
      .filter((r) => r.url.trim())
      .map((r) => ({
        url: r.url.trim(),
        alt: r.alt.trim() || "Product",
        isPrimary: r.isPrimary,
      }));
    if (rows.length === 0) return [];
    if (!rows.some((r) => r.isPrimary)) {
      rows = rows.map((r, i) => ({ ...r, isPrimary: i === 0 }));
    }
    return rows;
  }, [images]);

  const setPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((row, i) => ({ ...row, isPrimary: i === index })));
  };

  const handleUpload = async (index: number, file: File) => {
    setUploadError(null);
    setUploadingIdx(index);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "products");
      const res = await fetch("/api/hub/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; url?: string; message?: string };
      if (!res.ok || !json.ok || !json.url) {
        throw new Error(json.message ?? "Upload failed.");
      }
      setImages((prev) => prev.map((r, j) => (j === index ? { ...r, url: json.url! } : r)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      setUploadError(message);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <>
      <input type="hidden" name="sizes_json" value={JSON.stringify(sizesPayload)} />
      <input type="hidden" name="images_json" value={JSON.stringify(imagesPayload)} />

      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-600 dark:bg-stone-950/40">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
          Sizes &amp; stock
        </h3>
        <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
          Add one row per size. Shoppers pick these on the product page; stock must be a whole number.
        </p>
        <ul className="mt-3 space-y-2">
          {sizes.map((row, i) => (
            <li key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[100px] flex-1">
                <label className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                  Size label
                </label>
                <input
                  type="text"
                  value={row.size}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSizes((s) => s.map((r, j) => (j === i ? { ...r, size: v } : r)));
                  }}
                  placeholder="S, M, 38, ONE…"
                  className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                  Stock
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={row.stock}
                  placeholder=""
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned =
                      raw === ""
                        ? ""
                        : String(Math.max(0, Math.floor(Number(raw) || 0)));
                    setSizes((s) =>
                      s.map((r, j) => (j === i ? { ...r, stock: cleaned } : r)),
                    );
                  }}
                  className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
              <button
                type="button"
                onClick={() => setSizes((s) => s.filter((_, j) => j !== i))}
                disabled={sizes.length <= 1}
                className="mb-0.5 rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSizes((s) => [...s, { size: "", stock: "" }])}
          className="mt-3 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
        >
          + Add size
        </button>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-600 dark:bg-stone-950/40">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
          Product images
        </h3>
        <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
          Upload from your device, or paste a URL. Mark one as primary — it shows first in the shop.
        </p>
        {uploadError ? (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {uploadError}
          </p>
        ) : null}
        <ul className="mt-3 space-y-3">
          {images.map((row, i) => (
            <ImageRowEditor
              key={i}
              index={i}
              row={row}
              isUploading={uploadingIdx === i}
              canRemove={images.length > 1}
              onChange={(patch) =>
                setImages((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)))
              }
              onSetPrimary={() => setPrimaryImage(i)}
              onRemove={() => setImages((prev) => prev.filter((_, j) => j !== i))}
              onUpload={(file) => handleUpload(i, file)}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setImages((prev) => [...prev, { url: "", alt: "", isPrimary: false }])}
          className="mt-3 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
        >
          + Add image
        </button>
      </div>
    </>
  );
}

function ImageRowEditor({
  index,
  row,
  isUploading,
  canRemove,
  onChange,
  onSetPrimary,
  onRemove,
  onUpload,
}: {
  index: number;
  row: ImageRow;
  isUploading: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<ImageRow>) => void;
  onSetPrimary: () => void;
  onRemove: () => void;
  onUpload: (file: File) => void | Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <li className="rounded-lg border border-stone-100 p-3 dark:border-stone-700 dark:bg-stone-900/30">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
          <input
            type="radio"
            name="primary_image_pick"
            checked={row.isPrimary}
            onChange={onSetPrimary}
            className="rounded-full border-stone-300"
          />
          Primary
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-xs text-stone-500 hover:text-red-600 disabled:opacity-40 dark:text-stone-400"
        >
          Remove image
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-900/40">
          {row.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.url}
              alt={row.alt || "Product preview"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="px-2 text-center text-[10px] text-stone-400">
              No image yet
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label
              htmlFor={`image-url-${index}`}
              className="text-[10px] font-medium text-stone-500 dark:text-stone-400"
            >
              Image URL
            </label>
            <input
              id={`image-url-${index}`}
              type="text"
              value={row.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://… or upload below"
              className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {isUploading ? "Uploading…" : "Upload from device"}
            </button>
            <span className="text-[10px] text-stone-400">JPG · PNG · WEBP · up to 8MB</span>
          </div>

          <div>
            <label
              htmlFor={`image-alt-${index}`}
              className="text-[10px] font-medium text-stone-500 dark:text-stone-400"
            >
              Alt text (accessibility)
            </label>
            <input
              id={`image-alt-${index}`}
              type="text"
              value={row.alt}
              onChange={(e) => onChange({ alt: e.target.value })}
              placeholder="Short description of the photo"
              className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-950"
            />
          </div>
        </div>
      </div>
    </li>
  );
}
