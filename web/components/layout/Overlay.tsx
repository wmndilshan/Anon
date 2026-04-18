"use client";

import { useUi } from "@/components/providers/UiProvider";

export function Overlay() {
  const { overlayActive, closeMobilePanels } = useUi();
  return (
    <div
      className={`overlay ${overlayActive ? "active" : ""}`}
      data-overlay
      onClick={closeMobilePanels}
      aria-hidden={!overlayActive}
    />
  );
}
