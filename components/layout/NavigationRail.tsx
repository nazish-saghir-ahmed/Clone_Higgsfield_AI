"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image as ImageIcon, Film, Mic, Clapperboard, Sparkles } from "lucide-react";

export const NavigationRail: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/image",
      label: "Image Studio",
      sublabel: "T2I / 14-Slot I2I",
      icon: ImageIcon,
      activeColor: "text-accent-cyan",
      borderColor: "border-accent-cyan",
      glowBg: "bg-accent-cyan/10",
    },
    {
      href: "/video",
      label: "Video Studio",
      sublabel: "T2V / Motion Brush",
      icon: Film,
      activeColor: "text-accent-indigo",
      borderColor: "border-accent-indigo",
      glowBg: "bg-accent-indigo/10",
    },
    {
      href: "/lipsync",
      label: "Lip Sync Studio",
      sublabel: "Audio Speech Dub",
      icon: Mic,
      activeColor: "text-accent-lime",
      borderColor: "border-accent-lime",
      glowBg: "bg-accent-lime/10",
    },
    {
      href: "/cinema",
      label: "Cinema Studio",
      sublabel: "4-Wheel Camera Rig",
      icon: Clapperboard,
      activeColor: "text-rose-400",
      borderColor: "border-rose-400",
      glowBg: "bg-rose-500/10",
    },
  ];

  return (
    <nav className="relative z-20 flex items-center justify-center gap-2 p-2 bg-black/40 border-b border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/image");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap border ${
                isActive
                  ? `${item.activeColor} ${item.borderColor} ${item.glowBg} font-semibold shadow-[0_0_15px_rgba(255,255,255,0.05)] scale-[1.02]`
                  : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="font-display tracking-wide">{item.label}</span>
                <span className="text-[9px] font-mono opacity-60">{item.sublabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
