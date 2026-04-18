"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NewsletterModal } from "@/components/layout/NewsletterModal";
import { NotificationToast } from "@/components/layout/NotificationToast";
import { Overlay } from "@/components/layout/Overlay";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Overlay />
      <NewsletterModal />
      <NotificationToast />
      <Header />
      {children}
      <Footer />
    </>
  );
}
