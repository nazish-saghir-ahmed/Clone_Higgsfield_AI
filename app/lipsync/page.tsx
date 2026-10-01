"use client";

import React, { useState, useRef } from "react";
import { Mic, Music, Film, Upload, Play, Pause, RefreshCw, AlertCircle, Maximize2, Download, Sparkles, User, Video } from "lucide-react";
import { LIPSYNC_MODELS, getModelById } from "@/lib/registry";
import { UploadDropzone } from "@/components/shared/UploadDropzone";
import { submitGenerativeJob, executePollingLoop } from "@/lib/api-client";
import { normalizeOutputUrl } from "@/lib/url-normalizer";
import { addHistoryItem } from "@/lib/storage";
import { TelemetryFooter } from "@/components/layout/TelemetryFooter";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { GenerationHistoryItem, Resolution, UploadedAssetRecord } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

export default function LipSyncStudioPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>("infinite-talk-720p");
  const activeModel = getModelById(selectedModelId) || LIPSYNC_MODELS[0];

  const isVideoInputModel = Boolean(activeModel.inputs.videoField);

  // Asset inputs
  const [visualAsset, setVisualAsset] = useState<UploadedAssetRecord | null>(null);
  const [audioAsset, setAudioAsset] = useState<UploadedAssetRecord | null>(null);
  const [resolution, setResolution] = useState<Resolution>("720p");

  // Audio Playback Preview State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready for LipSync synthesis");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Output Viewport
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const toggleAudioPlayback = () => {
    if (!audioRef.current && audioAsset) {
      audioRef.current = new Audio(audioAsset.uploadedUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const handleGenerate = async () => {
    if (!visualAsset) {
      setErrorMessage(`Please upload a ${isVideoInputModel ? "source video (.mp4)" : "portrait image"} first.`);
      return;
    }
    if (!audioAsset) {
      setErrorMessage("Please upload a speech audio file (.mp3 or .wav).");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setProgress(0.05);
    setStatusText("Initializing LipSync synthesis...");
    setElapsedSeconds(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const payload: any = {
        audio_url: audioAsset.uploadedUrl,
        resolution: resolution,
      };

      if (isVideoInputModel) {
        payload.video_url = visualAsset.uploadedUrl;
      } else {
        payload.image_url = visualAsset.uploadedUrl;
      }

      // Step 1: Submit job
      const submission = await submitGenerativeJob(activeModel.endpoint, payload);
      setStatusText(`Job submitted (${submission.request_id.substring(0, 10)}...)`);

      // Step 2: Poll status loop
      const result = await executePollingLoop(submission.request_id, {
        intervalMs: 2500,
        signal: abortController.signal,
        onProgress: (status, prog, elapsed) => {
          setStatusText(`Synthesizing LipSync (${status})...`);
          setProgress(prog);
          setElapsedSeconds(elapsed);
        },
      });

      // Step 3: Normalize Output URL
      const finalUrl = normalizeOutputUrl(result);
      if (!finalUrl) {
        throw new Error("Unable to parse output LipSync video URL from response.");
      }

      setOutputVideoUrl(finalUrl);
      setStatusText("LipSync synthesis complete!");
      setProgress(1.0);

      // Step 4: Persist to History
      const historyItem: GenerationHistoryItem = {
        id: `hist_lip_${Date.now()}`,
        requestId: submission.request_id,
        studioType: "lipsync",
        modelId: activeModel.id,
        modelName: activeModel.name,
        prompt: `LipSync audio with ${visualAsset.name}`,
        outputUrl: finalUrl,
        mediaType: "video",
        resolution: resolution,
        executionSeconds: elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(historyItem);
    } catch (err: any) {
      if (err.message === "ABORTED") {
        setStatusText("LipSync synthesis canceled.");
      } else {
        console.error("LipSync generation error:", err);
        setErrorMessage(err.message || "LipSync synthesis failed.");
        setStatusText("Generation failed.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl w-full mx-auto">
        {/* Left Controls Panel */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4">
          <div className="glass-panel p-5 space-y-4">
            {/* Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-accent-lime" /> LipSync Speech Engine
              </label>

              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent-lime focus:ring-1 focus:ring-accent-lime/30 transition-all cursor-pointer"
              >
                {LIPSYNC_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0f111a] text-white">
                    {m.name} ({m.developer}) {m.badge ? `[${m.badge}]` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                {activeModel.description}
              </p>
            </div>

            {/* Dropzone 1: Visual Media (Image or Video) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  {isVideoInputModel ? <Video className="w-3.5 h-3.5 text-accent-cyan" /> : <User className="w-3.5 h-3.5 text-accent-cyan" />}
                  {isVideoInputModel ? "Source Video (.mp4)" : "Portrait Photo (.png/.jpg)"}
                </label>
                {visualAsset && (
                  <button
                    type="button"
                    onClick={() => setVisualAsset(null)}
                    className="text-[11px] text-slate-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>

              {visualAsset ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2 flex items-center gap-3">
                  <img
                    src={visualAsset.thumbnail || visualAsset.uploadedUrl}
                    alt={visualAsset.name}
                    className="w-14 h-14 rounded-lg object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{visualAsset.name}</p>
                    <p className="text-[10px] text-accent-cyan font-mono">Visual Media Attached</p>
                  </div>
                </div>
              ) : (
                <UploadDropzone
                  accept={isVideoInputModel ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp"}
                  maxFiles={1}
                  onAssetUploaded={(asset) => setVisualAsset(asset)}
                />
              )}
            </div>

            {/* Dropzone 2: Speech Audio (.mp3/.wav) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-accent-lime" /> Speech Audio Track (.mp3 / .wav)
                </label>
                {audioAsset && (
                  <button
                    type="button"
                    onClick={() => {
                      setAudioAsset(null);
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                      }
                      setIsPlayingAudio(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>

              {audioAsset ? (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={toggleAudioPlayback}
                      className="w-9 h-9 rounded-full bg-accent-lime text-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{audioAsset.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Audio Stream Ready</p>
                    </div>
                  </div>
                </div>
              ) : (
                <UploadDropzone
                  accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/mpeg"
                  maxFiles={1}
                  onAssetUploaded={(asset) => setAudioAsset(asset)}
                />
              )}
            </div>

            {/* Resolution Selector */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Output Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                className="w-full px-3 py-2 text-xs font-mono text-white bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-accent-lime"
              >
                {(activeModel.inputs.supported_resolutions || ["480p", "720p", "1080p"]).map((r) => (
                  <option key={r} value={r} className="bg-[#0f111a]">
                    {r} HD
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-sm text-black bg-gradient-to-r from-accent-lime via-accent-cyan to-accent-indigo rounded-xl hover:shadow-[0_0_25px_rgba(217,255,0,0.4)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synchronizing Lips ({Math.round(progress * 100)}%)...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Synthesize LipSync Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Stage Viewport */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="glass-panel w-full h-full min-h-[480px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {outputVideoUrl ? (
              <div className="relative group max-w-full max-h-[70vh] flex flex-col items-center">
                <video
                  src={outputVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-w-full max-h-[65vh] rounded-xl shadow-2xl object-contain border border-white/10"
                />

                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-2 rounded-xl bg-surface/90 text-white border border-white/10 hover:bg-white/20 transition-all shadow-lg"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4 text-accent-cyan" />
                  </button>
                  <button
                    onClick={() => downloadMediaAsset(outputVideoUrl, "aether-lipsync.mp4")}
                    className="p-2 rounded-xl bg-accent-lime text-black hover:bg-accent-lime/90 transition-all shadow-lg"
                    title="Download MP4"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-accent-lime/40">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Neural LipSync Stage</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Upload a portrait face and a speech track to animate natural phoneme-accurate lip motion and talking gestures.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {outputVideoUrl && (
        <LightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          mediaUrl={outputVideoUrl}
          mediaType="video"
          modelName={activeModel.name}
        />
      )}

      {/* Global Telemetry Footer */}
      <TelemetryFooter
        isGenerating={isGenerating}
        statusText={statusText}
        progress={progress}
        elapsedSeconds={elapsedSeconds}
        activeModelName={activeModel.name}
        resolution={resolution}
        onCancel={handleCancel}
      />
    </div>
  );
}
