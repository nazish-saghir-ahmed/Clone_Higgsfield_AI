"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Music, Film, Check, AlertCircle } from "lucide-react";
import { generateSquareThumbnail } from "@/lib/thumbnail";
import { uploadMediaFile } from "@/lib/api-client";
import { saveUploadedAsset } from "@/lib/storage";
import { UploadedAssetRecord } from "@/lib/types";

interface UploadDropzoneProps {
  accept?: string;
  maxFiles?: number;
  onAssetUploaded?: (asset: UploadedAssetRecord) => void;
  className?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  accept = "image/png,image/jpeg,image/webp,image/gif",
  maxFiles = 14,
  onAssetUploaded,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage("");
    setIsUploading(true);
    setUploadProgress(0);

    const fileArray = Array.from(files).slice(0, maxFiles);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        // 1. Generate local 80x80 thumbnail in browser canvas
        const thumbnail = await generateSquareThumbnail(file, 80);

        // 2. Upload file stream to neural gateway CDN
        const uploadRes = await uploadMediaFile(file, file.name, (pct) => {
          const totalProgress = Math.round(((i + pct / 100) / fileArray.length) * 100);
          setUploadProgress(totalProgress);
        });

        // 3. Construct persistent asset record
        const assetRecord: UploadedAssetRecord = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          uploadedUrl: uploadRes.url,
          thumbnail: thumbnail || uploadRes.url,
          timestamp: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        };

        // 4. Save to LocalStorage and trigger callback
        saveUploadedAsset(assetRecord);
        onAssetUploaded?.(assetRecord);
      } catch (err: any) {
        console.error("Upload error:", err);
        setErrorMessage(err.message || "File upload failed");
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
        isDragging
          ? "border-accent-cyan bg-accent-cyan/10 scale-[0.99]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="w-48 h-2 overflow-hidden rounded-full bg-white/10 mb-2">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-lime transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-accent-cyan">{uploadProgress}% Uploading...</span>
        </div>
      )}

      {/* Standard Dropzone UI */}
      <div className="p-3 mb-2 rounded-xl bg-white/5 text-accent-cyan group-hover:scale-110 transition-transform">
        <UploadCloud className="w-6 h-6" />
      </div>

      <p className="text-xs font-medium text-white text-center">
        Drop reference images or <span className="text-accent-cyan underline">browse</span>
      </p>
      <p className="text-[11px] text-slate-500 mt-1 text-center">
        PNG, JPEG, WEBP, MP3, WAV (Up to {maxFiles} slots)
      </p>

      {errorMessage && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
