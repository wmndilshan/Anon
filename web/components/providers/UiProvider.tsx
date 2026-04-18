"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MobilePanel = 0 | 1;

type UiContextValue = {
  modalClosed: boolean;
  closeModal: () => void;
  toastClosed: boolean;
  closeToast: () => void;
  overlayActive: boolean;
  activeMobilePanel: MobilePanel | null;
  openMobilePanel: (panel: MobilePanel) => void;
  closeMobilePanels: () => void;
  openAccordionIndex: number | null;
  toggleAccordion: (index: number) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [modalClosed, setModalClosed] = useState(false);
  const [toastClosed, setToastClosed] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobilePanel | null>(
    null,
  );
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(
    null,
  );

  const closeModal = useCallback(() => setModalClosed(true), []);
  const closeToast = useCallback(() => setToastClosed(true), []);

  const openMobilePanel = useCallback((panel: MobilePanel) => {
    setActiveMobilePanel(panel);
  }, []);

  const closeMobilePanels = useCallback(() => {
    setActiveMobilePanel(null);
  }, []);

  const toggleAccordion = useCallback((index: number) => {
    setOpenAccordionIndex((prev) => (prev === index ? null : index));
  }, []);

  const overlayActive = activeMobilePanel !== null;

  const value = useMemo(
    () => ({
      modalClosed,
      closeModal,
      toastClosed,
      closeToast,
      overlayActive,
      activeMobilePanel,
      openMobilePanel,
      closeMobilePanels,
      openAccordionIndex,
      toggleAccordion,
    }),
    [
      modalClosed,
      closeModal,
      toastClosed,
      closeToast,
      overlayActive,
      activeMobilePanel,
      openMobilePanel,
      closeMobilePanels,
      openAccordionIndex,
      toggleAccordion,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
