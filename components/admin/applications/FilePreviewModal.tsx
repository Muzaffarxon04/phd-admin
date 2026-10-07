"use client";

import { Button, Modal } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useAdminSurface } from "./ui";

export const PREVIEW_IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

export const getFileExt = (url: string) => {
  const pathPart = url.split("?")[0];
  return pathPart.split(".").pop()?.toLowerCase() || "";
};

const getProxyUrl = (url: string) => `/api/proxy-file?url=${encodeURIComponent(url)}`;

interface FilePreviewModalProps {
  /** Absolute file URL (or blob: URL); null hides the modal. */
  url: string | null;
  fileName: string;
  loading: boolean;
  onLoad: () => void;
  onClose: () => void;
}

/** Image / PDF preview modal sized to fit phone screens. */
export function FilePreviewModal({ url, fileName, loading, onLoad, onClose }: FilePreviewModalProps) {
  const s = useAdminSurface();

  const renderFilePreview = (displayUrl: string, originalUrl: string, name?: string) => {
    const ext = getFileExt(name || originalUrl);
    if (PREVIEW_IMAGE_EXTS.includes(ext)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- Dynamic file preview
        <img src={displayUrl} alt="Preview" className="max-h-[70vh] max-w-full object-contain" onLoad={onLoad} />
      );
    }
    if (ext === "pdf") {
      return (
        <object
          data={displayUrl}
          type="application/pdf"
          className="h-[65vh] w-full rounded sm:h-[70vh]"
          title="PDF preview"
          onLoad={onLoad}
        >
          <p className="py-8 text-center" style={{ color: s.muted }}>
            PDF ko&apos;rish uchun{" "}
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              yangi tabda oching
            </a>
          </p>
        </object>
      );
    }
    return (
      <div className="py-8 text-center">
        <FileTextOutlined style={{ fontSize: 48, color: s.isDark ? "#6b7280" : "#9ca3af" }} />
        <p className="mb-4 mt-4" style={{ color: s.muted }}>
          Ushbu fayl formatida oldindan ko&apos;rish mumkin emas
        </p>
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={name}
          className="inline-flex min-h-[44px] items-center text-blue-500 hover:underline"
        >
          Yuklab olish
        </a>
      </div>
    );
  };

  return (
    <Modal
      title="Fayl ko'rinishi"
      open={!!url}
      onCancel={onClose}
      footer={
        <Button onClick={onClose} className="min-h-[44px] w-full sm:min-h-0 sm:w-auto">
          Yopish
        </Button>
      }
      width={800}
      centered
      destroyOnClose
      zIndex={1100}
      styles={{ wrapper: { zIndex: 1100 } }}
    >
      {url && (
        <div className="relative flex justify-center overflow-hidden" style={{ minHeight: 240 }}>
          {loading && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded"
              style={{ background: s.isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }}
            >
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#7367f0]" />
              <span style={{ color: s.muted }}>Fayl yuklanmoqda...</span>
            </div>
          )}
          {renderFilePreview(url.startsWith("blob:") ? url : getProxyUrl(url), url, fileName)}
        </div>
      )}
    </Modal>
  );
}
