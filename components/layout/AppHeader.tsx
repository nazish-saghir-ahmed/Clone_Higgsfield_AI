"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal, User, Sparkles } from "lucide-react";

interface AppHeaderProps {
  onOpenAuth: () => void;
  onOpenHistory?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAuth, onOpenHistory }) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/image", label: "Image Studio" },
    { href: "/video", label: "Video Studio" },
    { href: "/lipsync", label: "Lip Sync" },
    { href: "/cinema", label: "Cinema Studio" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3.5 bg-[#050609]/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Left: Brand & Futuristic Subtitle */}
      <Link href="/image" className="flex items-center gap-3 group">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-indigo via-accent-cyan to-accent-lime p-[1px] shadow-[0_0_15px_rgba(0,219,233,0.3)]">
          <div className="w-full h-full bg-[#050609] rounded-[7px] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-accent-cyan group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-white uppercase font-sans">
            Aether AI
          </span>
          <span className="text-[9px] font-mono tracking-widest text-accent-cyan uppercase font-medium">
            Neural Studio
          </span>
        </div>
      </Link>

      {/* Center: Clean Pill-Shaped Navigation Bar */}
      <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-inner">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/image");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "nav-pill-active"
                  : "nav-pill-inactive"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Version Badge, Settings Button, Profile Circle */}
      <div className="flex items-center gap-2.5">
        {/* Version Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[10px] font-mono font-medium text-slate-400">
          <span className="text-accent-cyan font-semibold">v4.7</span>
          <span className="text-accent-lime font-bold">PRO</span>
        </div>

        {/* Settings / BYOK Modal Trigger */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
          title="Configure API Gateway Key & Settings"
        >
          <span className="text-xs">Settings</span>
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* User Profile Circle */}
        <button
          onClick={onOpenHistory}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
          title="Generation History"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
