"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Image as ImageIcon, Check, Trash2 } from "lucide-react";
import { UploadedAssetRecord } from "@/lib/types";
import { getStoredUploads, removeUploadedAsset } from "@/lib/storage";
import { UploadDropzone } from "../shared/UploadDropzone";

interface ReferenceTrayProps {
  selectedAssets: UploadedAssetRecord[];
  maxSlots?: number;
  onSelectionChange: (assets: UploadedAssetRecord[]) => void;
}

export const ReferenceTray: React.FC<ReferenceTrayProps> = ({
  selectedAssets,
  maxSlots = 14,
  onSelectionChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cachedUploads, setCachedUploads] = useState<UploadedAssetRecord[]>([]);
  const [tempSelection, setTempSelection] = useState<UploadedAssetRecord[]>([]);

  const reloadUploads = () => {
    setCachedUploads(getStoredUploads());
  };

  useEffect(() => {
    if (isModalOpen) {
      reloadUploads();
      setTempSelection([...selectedAssets]);
    }
  }, [isModalOpen, selectedAssets]);

  const handleRemoveSlot = (index: number) => {
    const updated = [...selectedAssets];
    updated.splice(index, 1);
    onSelectionChange(updated);
  };

  const handleToggleSelectInModal = (asset: UploadedAssetRecord) => {
    const exists = tempSelection.some((item) => item.id === asset.id);
    if (exists) {
      setTempSelection(tempSelection.filter((item) => item.id !== asset.id));
    } else {
      if (tempSelection.length >= maxSlots) {
        alert(`Maximum ${maxSlots} reference slots allowed.`);
        return;
      }
      setTempSelection([...tempSelection, asset]);
    }
  };

  const handleConfirmModal = () => {
    onSelectionChange(tempSelection);
    setIsModalOpen(false);
  };

  const handleDeleteCachedAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeUploadedAsset(id);
    reloadUploads();
    setTempSelection(tempSelection.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-accent-cyan" /> Reference Tray ({selectedAssets.length}/{maxSlots})
        </label>
        {selectedAssets.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectionChange([])}
            className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Horizontal Tray Slots */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {/* Add Slot Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-16 flex-shrink-0 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:border-accent-cyan/50 hover:bg-accent-cyan/5 transition-all group"
          title="Add Reference Images"
        >
          <Plus className="w-5 h-5 text-slate-400 group-hover:text-accent-cyan transition-colors" />
          <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-300 mt-0.5">Add</span>
        </button>

        {/* Populated Slots with Numbered Order Badges */}
        {selectedAssets.map((asset, idx) => (
          <div
            key={asset.id}
            className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 group bg-black/40 shadow-sm"
          >
            <img
              src={asset.thumbnail || asset.uploadedUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
            />

            {/* Numbered Order Badge (1-indexed) */}
            <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-md bg-accent-cyan text-black font-mono font-bold text-[10px] shadow-md">
              {idx + 1}
            </div>

            {/* Remove X Overlay */}
            <button
              type="button"
              onClick={() => handleRemoveSlot(idx)}
              className="absolute top-1 right-1 p-0.5 rounded-md bg-black/70 text-slate-300 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
              title="Remove Reference"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Multi-Select Reference Asset Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl p-6 bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white font-display">Reference Image Library</h3>
                <p className="text-xs text-slate-400">Select up to {maxSlots} images for conditioning synthesis.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
              {/* Dropzone for new uploads */}
              <UploadDropzone
                maxFiles={maxSlots}
                onAssetUploaded={(newAsset) => {
                  reloadUploads();
                  setTempSelection((prev) => (prev.length < maxSlots ? [...prev, newAsset] : prev));
                }}
              />

              {/* Cached Assets Grid */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Previously Uploaded Assets</h4>
                {cachedUploads.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-6">No cached assets available. Upload files above.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {cachedUploads.map((asset) => {
                      const isSelected = tempSelection.some((item) => item.id === asset.id);
                      const selectedIdx = tempSelection.findIndex((item) => item.id === asset.id);

                      return (
                        <div
                          key={asset.id}
                          onClick={() => handleToggleSelectInModal(asset)}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                            isSelected
                              ? "border-accent-cyan shadow-[0_0_15px_rgba(0,219,233,0.3)] scale-[0.97]"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <img
                            src={asset.thumbnail || asset.uploadedUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Selected Check / Order Badge */}
                          {isSelected && (
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-accent-cyan text-black font-mono font-bold text-[10px] flex items-center justify-center shadow-md">
                              {selectedIdx + 1}
                            </div>
                          )}

                          {/* Delete Asset Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCachedAsset(asset.id, e)}
                            className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete from Library"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs font-mono text-slate-400">
                {tempSelection.length} of {maxSlots} slots selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModal}
                  className="px-5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-accent-cyan to-accent-lime rounded-xl hover:shadow-[0_0_20px_rgba(0,219,233,0.4)] transition-all"
                >
                  Use Selected ({tempSelection.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
