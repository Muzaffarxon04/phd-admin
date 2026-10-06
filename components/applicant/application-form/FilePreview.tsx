"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Spin } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { Sheet } from "@/components/applicant/ui/Sheet";

export interface PreviewFile {
  name: string;
  /** Remote URL (proxied) or a local File/Blob. */
  url?: string;
  file?: File | Blob;
}

export function proxyUrl(url: string): string {
  return url.startsWith("/api/") || url.startsWith("blob:") ? url : `/api/proxy-file?url=${encodeURIComponent(url)}`;
}

export function fileExt(nameOrUrl: string): string {
  return nameOrUrl.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

/** Trigger a browser download for a remote or local file. */
export function downloadFile(target: PreviewFile) {
  const a = document.createElement("a");
  if (target.file) {
    const blobUrl = URL.createObjectURL(target.file);
    a.href = blobUrl;
    a.download = target.name || "file";
    a.click();
    URL.revokeObjectURL(blobUrl);
    return;
  }
  if (!target.url) return;
  a.href = proxyUrl(target.url);
  a.download = target.name || "file";
  a.target = "_blank";
  a.click();
}

interface FilePreviewProps {
  target: PreviewFile | null;
  onClose: () => void;
}

/** Image/PDF preview in a responsive sheet; other types offer a download. */
export function FilePreview({ target, onClose }: FilePreviewProps) {
  // Object URL for local files; derived from the target, revoked when it changes.
  const src = useMemo(() => {
    if (!target) return null;
    if (target.file) return URL.createObjectURL(target.file);
    return target.url ? proxyUrl(target.url) : null;
  }, [target]);
  useEffect(() => {
    if (src?.startsWith("blob:")) return () => URL.revokeObjectURL(src);
  }, [src]);

  const ext = target ? fileExt(target.name || target.url || "") : "";
  const isImage = IMAGE_EXTS.includes(ext);
  const isPdf = ext === "pdf";

  // "loading" = a previewable src that has not reported load yet (15s safety timeout).
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loading = !!src && (isImage || isPdf) && loadedSrc !== src;
  useEffect(() => {
    if (!loading || !src) return;
    const t = setTimeout(() => setLoadedSrc(src), 15000);
    return () => clearTimeout(t);
  }, [loading, src]);
  const markLoaded = () => setLoadedSrc(src);

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      title={target?.name || "Fayl"}
      width={840}
      footer={
        <div className="flex gap-2 sm:justify-end">
          {target && (
            <Button onClick={() => downloadFile(target)} className="flex-1 sm:flex-none">
              Yuklab olish
            </Button>
          )}
          <Button type="primary" onClick={onClose} className="flex-1 sm:flex-none">
            Yopish
          </Button>
        </div>
      }
    >
      <div className="relative flex min-h-[240px] items-center justify-center">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70">
            <Spin />
          </div>
        )}
        {src && isImage && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic blob/proxy preview
          <img src={src} alt="" className="max-h-[70dvh] max-w-full object-contain" onLoad={markLoaded} />
        )}
        {src && isPdf && (
          <object data={src} type="application/pdf" className="h-[70dvh] w-full rounded-lg" onLoad={markLoaded}>
            <p className="py-8 text-center text-sm text-muted">
              PDF ko&apos;rish uchun{" "}
              <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                yangi oynada oching
              </a>
            </p>
          </object>
        )}
        {src && !isImage && !isPdf && (
          <div className="py-8 text-center">
            <FileTextOutlined className="text-4xl text-muted" />
            <p className="mt-3 text-sm text-muted">Bu fayl turini oldindan ko&apos;rib bo&apos;lmaydi</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
