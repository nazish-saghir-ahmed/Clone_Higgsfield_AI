"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Download, Maximize2, RefreshCw, Film, Image as ImageIcon, Mic, Clapperboard } from "lucide-react";
import { getHistory, removeHistoryItem, clearHistory } from "@/lib/storage";
import { GenerationHistoryItem } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (item: GenerationHistoryItem) => void;
  onOpenLightbox?: (url: string, type: "image" | "video", prompt?: string, modelName?: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  onOpenLightbox,
}) => {
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const refreshHistory = () => {
    setHistoryItems(getHistory());
  };

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) => {
    if (filterType === "all") return true;
    return item.studioType === filterType;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeHistoryItem(id);
    refreshHistory();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all generation history?")) {
      clearHistory();
      refreshHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md h-full bg-[#0f111a] border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">Generation History</h3>
            <span className="px-2 py-0.5 text-[11px] font-mono text-accent-cyan bg-accent-cyan/10 rounded-full">
              {filteredItems.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Clear All History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/20">
          {[
            { id: "all", label: "All" },
            { id: "image", label: "Image", icon: ImageIcon },
            { id: "video", label: "Video", icon: Film },
            { id: "lipsync", label: "LipSync", icon: Mic },
            { id: "cinema", label: "Cinema", icon: Clapperboard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filterType === tab.id
                    ? "text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
              <Film className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">No generations recorded</p>
              <p className="text-xs text-slate-600 mt-1">Generated images and videos will appear here.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isVideo = item.mediaType === "video";
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia?.(item)}
                  className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent-cyan/30 hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <div className="flex gap-3">
                    {/* Media Thumbnail */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                      {isVideo ? (
                        <video
                          src={item.outputUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={item.thumbnailUrl || item.outputUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-1 left-1 px-1 py-0.5 text-[9px] font-mono uppercase rounded bg-black/70 text-white backdrop-blur-xs">
                        {item.studioType}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-white truncate font-display">
                          {item.modelName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.prompt || "No prompt provided"}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLightbox?.(item.outputUrl, item.mediaType, item.prompt, item.modelName);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Zoom</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadMediaAsset(item.outputUrl, isVideo ? "video.mp4" : "image.png");
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-auto"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
