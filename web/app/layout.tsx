import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { UiProvider } from "@/components/providers/UiProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anon - eCommerce Website",
  description: "Anon ecommerce store",
  icons: { icon: "/assets/images/logo/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/css/style-prefix.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <UiProvider>
          <SiteShell>
            <main>{children}</main>
          </SiteShell>
        </UiProvider>
        <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js" type="module" />
        <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js" noModule />
      </body>
    </html>
  );
}
