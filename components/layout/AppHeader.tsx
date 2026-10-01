"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Key, History, Settings, ExternalLink } from "lucide-react";
import { getApiKey } from "@/lib/storage";

interface AppHeaderProps {
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  isAuthValid?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenAuth,
  onOpenHistory,
}) => {
  const hasApiKey = Boolean(getApiKey());

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-3.5 bg-surface/70 border-b border-white/10 backdrop-blur-xl">
      {/* Brand Title */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-indigo via-accent-cyan to-accent-lime p-[1px] shadow-[0_0_20px_rgba(0,219,233,0.3)]">
          <div className="w-full h-full bg-[#06070a] rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-cyan group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-wider text-white uppercase font-display">
              Aether
            </h1>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-black uppercase bg-accent-cyan rounded">
              Neural Studio
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">Open Alternative Creative Workstation</p>
        </div>
      </Link>

      {/* Global Actions */}
      <div className="flex items-center gap-2.5">
        {/* BYOK Auth Status Pill */}
        <button
          onClick={onOpenAuth}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            hasApiKey
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
          }`}
          title="Configure API Gateway Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">
            {hasApiKey ? "Gateway: Connected" : "BYOK: Set API Key"}
          </span>
          <span className={`w-2 h-2 rounded-full ${hasApiKey ? "bg-emerald-400" : "bg-amber-400"}`} />
        </button>

        {/* History Toggle */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
          title="Open Generation History"
        >
          <History className="w-3.5 h-3.5 text-accent-indigo" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>
    </header>
  );
};
