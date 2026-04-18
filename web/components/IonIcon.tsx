"use client";

import type { HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": HTMLAttributes<HTMLElement> & { name?: string };
    }
  }
}

type IonIconProps = {
  name: string;
  className?: string;
};

/** Wraps Ionicons web component (loaded via next/script in layout). */
export function IonIcon({ name, className }: IonIconProps) {
  return <ion-icon name={name} className={className} suppressHydrationWarning />;
}
