"use client";

import React, { useState } from "react";
import "./globals.css";
import { CursorParticleCanvas } from "@/components/canvas/CursorParticleCanvas";
import { AppHeader } from "@/components/layout/AppHeader";
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
        <title>Aether AI — Neural Studio</title>
        <meta
          name="description"
          content="Premium futuristic AI creative workstation for next-generation image, video, and audio synthesis"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#050609] text-slate-100 overflow-x-hidden antialiased">
        {/* Custom High-Performance Cursor & Ambient Particle Physics System */}
        <CursorParticleCanvas />

        {/* Global Layout Shell */}
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">
          <AppHeader
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />

          {/* Studio Viewport */}
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
