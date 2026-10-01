"use client";

import React, { useState, useRef } from "react";
import { Clapperboard, Sparkles, Wand2, Download, Maximize2, RefreshCw, AlertCircle, Eye, Camera, Focus } from "lucide-react";
import { FourWheelRig } from "@/components/cinema/FourWheelRig";
import { getModelById, T2I_MODELS } from "@/lib/registry";
import { submitGenerativeJob, executePollingLoop } from "@/lib/api-client";
import { normalizeOutputUrl } from "@/lib/url-normalizer";
import { addHistoryItem } from "@/lib/storage";
import { TelemetryFooter } from "@/components/layout/TelemetryFooter";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { GenerationHistoryItem, Resolution } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

export default function CinemaStudioPage() {
  const [basePrompt, setBasePrompt] = useState("A mysterious detective standing in rain under neon streetlights");
  const [compiledPrompt, setCompiledPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>("flux-dev");
  const activeModel = getModelById(selectedModelId) || T2I_MODELS[0];

  const [resolution, setResolution] = useState<Resolution>("2K");

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Cinema Rig Ready");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Output Viewport
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleGenerate = async () => {
    if (!compiledPrompt.trim()) {
      setErrorMessage("Please enter a scene description.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setProgress(0.05);
    setStatusText("Initializing Cinema render...");
    setElapsedSeconds(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const payload: any = {
        prompt: compiledPrompt,
        aspect_ratio: "21:9", // CinemaScope 2.39:1 aspect ratio
        resolution: resolution,
      };

      // Step 1: Submit job
      const submission = await submitGenerativeJob(activeModel.endpoint, payload);
      setStatusText(`Cinema Job dispatched (${submission.request_id.substring(0, 10)}...)`);

      // Step 2: Poll status loop
      const result = await executePollingLoop(submission.request_id, {
        intervalMs: 2000,
        signal: abortController.signal,
        onProgress: (status, prog, elapsed) => {
          setStatusText(`Rendering 2.39:1 Cinema Master (${status})...`);
          setProgress(prog);
          setElapsedSeconds(elapsed);
        },
      });

      // Step 3: Normalize Output URL
      const finalUrl = normalizeOutputUrl(result);
      if (!finalUrl) {
        throw new Error("Unable to parse output image URL from response.");
      }

      setOutputImageUrl(finalUrl);
      setStatusText("Cinema Render complete!");
      setProgress(1.0);

      // Step 4: Persist to History
      const historyItem: GenerationHistoryItem = {
        id: `hist_cine_${Date.now()}`,
        requestId: submission.request_id,
        studioType: "cinema",
        modelId: activeModel.id,
        modelName: activeModel.name,
        prompt: compiledPrompt,
        outputUrl: finalUrl,
        thumbnailUrl: finalUrl,
        mediaType: "image",
        aspectRatio: "21:9",
        resolution: resolution,
        executionSeconds: elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(historyItem);
    } catch (err: any) {
      if (err.message === "ABORTED") {
        setStatusText("Cinema render canceled.");
      } else {
        console.error("Cinema render error:", err);
        setErrorMessage(err.message || "Cinema synthesis failed.");
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
      <div className="flex-1 flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Scene Direction & 4-Wheel Virtual Camera Controls */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-display">Virtual Cinema Studio</h2>
                <p className="text-xs text-slate-400">4-Wheel Optical Rig & 2.39:1 CinemaScope Compiler</p>
              </div>
            </div>

            {/* Model & Resolution Pickers */}
            <div className="flex items-center gap-2">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-rose-400"
              >
                {T2I_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0f111a]">
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                className="px-3 py-1.5 text-xs font-mono text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-rose-400"
              >
                <option value="2K" className="bg-[#0f111a]">2K Scope</option>
                <option value="4K" className="bg-[#0f111a]">4K Master</option>
              </select>
            </div>
          </div>

          {/* Scene Direction Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Scene Core Narrative
            </label>
            <input
              type="text"
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Describe the subject, environment, and mood..."
              className="w-full px-3.5 py-2.5 text-xs text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* 4-Wheel Optical Carousel Rig */}
          <FourWheelRig
            basePrompt={basePrompt}
            onCompiledPromptChange={(comp) => setCompiledPrompt(comp)}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Render Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-sm text-black bg-gradient-to-r from-rose-500 via-accent-indigo to-accent-cyan rounded-xl hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering Cinema Master ({Math.round(progress * 100)}%)...</span>
              </>
            ) : (
              <>
                <Clapperboard className="w-4 h-4" />
                <span>Render 2.39:1 Master Cinema Frame</span>
              </>
            )}
          </button>
        </div>

        {/* 2.39:1 CinemaScope Letterbox Viewport */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          {outputImageUrl ? (
            <div className="relative group w-full max-w-5xl aspect-[21/9] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center">
              <img
                src={outputImageUrl}
                alt={compiledPrompt}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface/90 text-white border border-white/10 hover:bg-white/20 transition-all font-semibold text-xs shadow-lg"
                >
                  <Maximize2 className="w-4 h-4 text-rose-400" />
                  <span>Zoom Master Frame</span>
                </button>
                <button
                  onClick={() => downloadMediaAsset(outputImageUrl, "cinema-render.png")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all font-semibold text-xs shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 4K Scope</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-rose-400/40">
                <Clapperboard className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white font-display">2.39:1 CinemaScope Stage</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Configure the optical camera rig above and click Render to output ACEScg Hollywood-grade compositions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {outputImageUrl && (
        <LightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          mediaUrl={outputImageUrl}
          mediaType="image"
          prompt={compiledPrompt}
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
        resolution="2.39:1"
        onCancel={handleCancel}
      />
    </div>
  );
}
