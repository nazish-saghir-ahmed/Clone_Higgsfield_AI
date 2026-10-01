"use client";

import React, { useState } from "react";
import "./globals.css";
import { PlasmaCanvas } from "@/components/canvas/PlasmaCanvas";
import { AppHeader } from "@/components/layout/AppHeader";
import { NavigationRail } from "@/components/layout/NavigationRail";
import { BYOKAuthModal } from "@/components/auth/BYOKAuthModal";
import { HistoryDrawer } from "@/components/shared/HistoryDrawer";
import { LightboxModal } from "@/components/shared/LightboxModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    mediaUrl: string;
    mediaType: "image" | "video";
    prompt?: string;
    modelName?: string;
  }>({
    isOpen: false,
    mediaUrl: "",
    mediaType: "image",
  });

  return (
    <html lang="en" className="dark">
      <head>
        <title>Aether Neural Studio - Open Generative Workstation</title>
        <meta
          name="description"
          content="Production-grade open-source neural synthesis studio for images, video, lip sync, and cinema"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#06070a] text-slate-100 overflow-x-hidden antialiased">
        {/* Background Hardware-Accelerated WebGL Plasma Shader */}
        <PlasmaCanvas />

        {/* Global Layout Shell */}
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">
          <AppHeader
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />

          <NavigationRail />

          {/* Main Studio Viewport */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>

        {/* Global BYOK Authentication Modal */}
        <BYOKAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        {/* Global History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onOpenLightbox={(url, type, prompt, model) => {
            setLightboxState({
              isOpen: true,
              mediaUrl: url,
              mediaType: type,
              prompt,
              modelName: model,
            });
          }}
        />

        {/* Global Lightbox Modal */}
        <LightboxModal
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
          mediaUrl={lightboxState.mediaUrl}
          mediaType={lightboxState.mediaType}
          prompt={lightboxState.prompt}
          modelName={lightboxState.modelName}
        />
      </body>
    </html>
  );
}
