"use client";

import { Drawer, Modal } from "antd";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Desktop modal width. */
  width?: number;
  /** Max height of the mobile sheet (CSS length). */
  maxHeight?: string;
  destroyOnClose?: boolean;
  zIndex?: number;
}

/**
 * Responsive dialog: centered modal on ≥768px, bottom sheet on mobile.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  width = 560,
  maxHeight = "88dvh",
  destroyOnClose,
  zIndex,
}: SheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        placement="bottom"
        height="auto"
        title={null}
        closable={false}
        rootClassName="ui-sheet"
        destroyOnHidden={destroyOnClose}
        zIndex={zIndex}
        styles={{
          wrapper: { maxHeight, height: "auto" },
          content: { maxHeight },
          body: { overflowY: "auto" },
          footer: { padding: "12px 16px calc(12px + env(safe-area-inset-bottom))" },
        }}
        footer={footer}
        extra={null}
      >
        <div aria-hidden className="ui-sheet-handle mb-3" />
        {title && <h3 className="mb-3 text-base font-semibold text-text">{title}</h3>}
        {children}
      </Drawer>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      footer={footer ?? null}
      width={width}
      centered
      destroyOnHidden={destroyOnClose}
      zIndex={zIndex}
      styles={{ body: { paddingTop: 8 } }}
    >
      {children}
    </Modal>
  );
}
