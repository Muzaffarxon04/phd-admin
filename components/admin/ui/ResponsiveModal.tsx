"use client";

import { Modal, type ModalProps } from "antd";
import { useAdminBreakpoint } from "./useAdminBreakpoint";
import "./admin-ui.css";

export interface ResponsiveModalProps extends ModalProps {
  /**
   * On phones (< 640px) render as a bottom sheet: full width, docked to the
   * bottom, rounded top, scrollable body, sticky full-width footer buttons.
   * Default `true`. Tablet/desktop always use the regular centered-ish modal.
   */
  sheetOnMobile?: boolean;
}

/**
 * Drop-in replacement for antd `Modal` that fits phone screens.
 * Accepts every antd Modal prop; `width`, `centered` and `top` styles are
 * ignored in sheet mode. Wide modals are clamped to the viewport on tablets.
 */
export function ResponsiveModal({ sheetOnMobile = true, className, wrapClassName, width, centered, style, ...rest }: ResponsiveModalProps) {
  const { isMobile } = useAdminBreakpoint();
  const sheet = sheetOnMobile && isMobile;

  if (sheet) {
    return (
      <Modal
        {...rest}
        width="100%"
        centered={false}
        className={`admin-sheet-modal ${className ?? ""}`}
        wrapClassName={`admin-sheet-modal-wrap ${wrapClassName ?? ""}`}
      />
    );
  }

  return (
    <Modal
      {...rest}
      width={width}
      centered={centered}
      className={className}
      wrapClassName={wrapClassName}
      style={{ maxWidth: "calc(100vw - 32px)", ...style }}
    />
  );
}
