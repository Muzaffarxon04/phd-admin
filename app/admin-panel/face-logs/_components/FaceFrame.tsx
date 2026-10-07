"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { API_BASE_URL } from "@/lib/hooks/useUniversalFetch";
import { tokenStorage } from "@/lib/utils";

/*
 * Face-check frames are served by the API behind the admin Bearer token, so a
 * plain <img src> cannot load them. Each frame is fetched with the token into a
 * Blob (cached per URL for the session so the thumbnail and the detail view
 * share one request) and shown through an object URL that is revoked on unmount.
 */

const MAX_CACHE = 150;
const blobCache = new Map<string, Promise<Blob>>();

function resolveUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function fetchFrame(url: string): Promise<Blob> {
  const cached = blobCache.get(url);
  if (cached) return cached;

  const token = tokenStorage.getAccessToken();
  const request = fetch(resolveUrl(url), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  }).then((res) => {
    if (!res.ok) throw new Error(String(res.status));
    return res.blob();
  });

  // Failed requests are not cached so they can be retried on the next mount.
  request.catch(() => blobCache.delete(url));
  blobCache.set(url, request);
  if (blobCache.size > MAX_CACHE) {
    const oldest = blobCache.keys().next().value;
    if (oldest !== undefined) blobCache.delete(oldest);
  }
  return request;
}

interface FaceFrameProps {
  url: string;
  alt: string;
  /** Caption under / over the image (e.g. pose label). */
  caption?: string;
  /** "thumb" = small square (lazy loaded when scrolled into view), "large" = detail view. */
  size?: "thumb" | "large";
}

export function FaceFrame({ url, alt, caption, size = "thumb" }: FaceFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(size === "large");
  const [state, setState] = useState<{ url: string; src: string | null; failed: boolean }>({
    url,
    src: null,
    failed: false,
  });

  // Lazy: start loading thumbnails only once they approach the viewport.
  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    fetchFrame(url)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url, src: objectUrl, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ url, src: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, visible]);

  const current = state.url === url ? state : { src: null, failed: false };
  const isThumb = size === "thumb";

  return (
    <figure className="m-0 min-w-0">
      <div
        ref={ref}
        className={`relative flex items-center justify-center overflow-hidden ${isThumb ? "h-14 w-14 rounded-lg" : "aspect-[3/4] w-full rounded-xl"}`}
        style={{ background: "var(--admin-surface-2)", border: "1px solid var(--admin-border)" }}
      >
        {current.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: object URL, not optimisable by next/image
          <img src={current.src} alt={alt} className="h-full w-full object-cover" draggable={false} />
        ) : current.failed ? (
          <PictureOutlined className="admin-muted" style={{ fontSize: isThumb ? 18 : 32 }} aria-label="Rasm yuklanmadi" />
        ) : isThumb ? (
          <Skeleton.Avatar active shape="square" size={56} />
        ) : (
          <Skeleton.Image active style={{ width: "100%", height: "100%" }} />
        )}
      </div>
      {caption ? (
        <figcaption className={`admin-muted mt-1 text-center ${isThumb ? "text-[11px] leading-none" : "text-[13px] font-medium"}`}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
