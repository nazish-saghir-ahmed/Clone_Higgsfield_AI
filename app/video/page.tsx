"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film, Play, Pause, Download, Maximize2, RefreshCw, AlertCircle, Compass, Upload, Sparkles, Paintbrush } from "lucide-react";
import { T2V_MODELS, I2V_MODELS, getModelById } from "@/lib/registry";
import { MotionBrushCanvas } from "@/components/canvas/MotionBrushCanvas";
import { UploadDropzone } from "@/components/shared/UploadDropzone";
import { submitGenerativeJob, executePollingLoop } from "@/lib/api-client";
import { normalizeOutputUrl } from "@/lib/url-normalizer";
import { addHistoryItem } from "@/lib/storage";
import { TelemetryFooter } from "@/components/layout/TelemetryFooter";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { AspectRatio, GenerationHistoryItem, MotionMode, MotionVector, UploadedAssetRecord, VideoDuration } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

export default function VideoStudioPage() {
  // Start Frame for I2V vs T2V
  const [startFrameAsset, setStartFrameAsset] = useState<UploadedAssetRecord | null>(null);
  const isI2VMode = Boolean(startFrameAsset);
  const availableModels = isI2VMode ? I2V_MODELS : T2V_MODELS;

  // Active Model State
  const [selectedModelId, setSelectedModelId] = useState<string>(
    isI2VMode ? "kling-i2v" : "kling-v2-1-t2v"
  );

  useEffect(() => {
    if (isI2VMode) {
      if (!I2V_MODELS.some((m) => m.id === selectedModelId)) {
        setSelectedModelId("kling-i2v");
      }
    } else {
      if (!T2V_MODELS.some((m) => m.id === selectedModelId)) {
        setSelectedModelId("kling-v2-1-t2v");
      }
    }
  }, [isI2VMode]);

  const activeModel = getModelById(selectedModelId) || availableModels[0];

  // Parameters
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [motionMode, setMotionMode] = useState<MotionMode>("normal");

  // Motion Brush State
  const [isBrushModalOpen, setIsBrushModalOpen] = useState(false);
  const [motionTrajectory, setMotionTrajectory] = useState<{
    maskDataUrl: string;
    vector: MotionVector;
  } | null>(null);

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready for video synthesis");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Output Viewport
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleGenerate = async () => {
    if (!isI2VMode && !prompt.trim()) {
      setErrorMessage("Text prompt is mandatory for Text-to-Video synthesis.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setProgress(0.05);
    setStatusText("Initializing video synthesis job...");
    setElapsedSeconds(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const payload: any = {
        prompt: prompt.trim() || (isI2VMode ? "Cinematic motion flow" : ""),
        duration: duration,
        aspect_ratio: aspectRatio,
        mode: motionMode,
      };

      if (isI2VMode && startFrameAsset) {
        payload.image_url = startFrameAsset.uploadedUrl;
      }

      if (motionTrajectory) {
        payload.motion_trajectories = [
          {
            mask_url: motionTrajectory.maskDataUrl,
            dx: motionTrajectory.vector.dx,
            dy: motionTrajectory.vector.dy,
            intensity: motionTrajectory.vector.intensity,
          },
        ];
      }

      // Step 1: Submit job
      const submission = await submitGenerativeJob(activeModel.endpoint, payload);
      setStatusText(`Job submitted (${submission.request_id.substring(0, 10)}...)`);

      // Step 2: Poll status loop
      const result = await executePollingLoop(submission.request_id, {
        intervalMs: 2500,
        signal: abortController.signal,
        onProgress: (status, prog, elapsed) => {
          setStatusText(`Synthesizing Video (${status})...`);
          setProgress(prog);
          setElapsedSeconds(elapsed);
        },
      });

      // Step 3: Normalize Output URL
      const finalUrl = normalizeOutputUrl(result);
      if (!finalUrl) {
        throw new Error("Unable to parse output video URL from response.");
      }

      setOutputVideoUrl(finalUrl);
      setStatusText("Video synthesis complete!");
      setProgress(1.0);

      // Step 4: Persist to History
      const historyItem: GenerationHistoryItem = {
        id: `hist_vid_${Date.now()}`,
        requestId: submission.request_id,
        studioType: "video",
        modelId: activeModel.id,
        modelName: activeModel.name,
        prompt: prompt.trim(),
        outputUrl: finalUrl,
        mediaType: "video",
        aspectRatio: aspectRatio,
        duration: duration,
        executionSeconds: elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(historyItem);
    } catch (err: any) {
      if (err.message === "ABORTED") {
        setStatusText("Video synthesis canceled.");
      } else {
        console.error("Video generation error:", err);
        setErrorMessage(err.message || "Video synthesis failed.");
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
            {/* Mode & Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-accent-indigo" /> Video Engine
                </label>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  isI2VMode ? "bg-accent-indigo/20 text-accent-indigo" : "bg-accent-cyan/20 text-accent-cyan"
                }`}>
                  {isI2VMode ? "I2V Image Motion" : "T2V Text Motion"}
                </span>
              </div>

              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0f111a] text-white">
                    {m.name} ({m.developer}) {m.badge ? `[${m.badge}]` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                {activeModel.description}
              </p>
            </div>

            {/* Start-Frame Conditioning Dropzone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Start-Frame Image {isI2VMode && "(Active)"}
                </label>
                {startFrameAsset && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartFrameAsset(null);
                      setMotionTrajectory(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Remove Frame
                  </button>
                )}
              </div>

              {startFrameAsset ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2 flex items-center gap-3">
                  <img
                    src={startFrameAsset.thumbnail || startFrameAsset.uploadedUrl}
                    alt="Start Frame"
                    className="w-16 h-16 rounded-lg object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{startFrameAsset.name}</p>
                    <p className="text-[10px] text-accent-indigo font-mono">Image-to-Video Enabled</p>

                    <button
                      type="button"
                      onClick={() => setIsBrushModalOpen(true)}
                      className="mt-1.5 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-black bg-accent-cyan hover:bg-accent-cyan/90 rounded-md transition-all shadow-sm"
                    >
                      <Paintbrush className="w-3 h-3" />
                      <span>{motionTrajectory ? "Edit Motion Brush" : "Paint Motion Brush"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <UploadDropzone
                  maxFiles={1}
                  onAssetUploaded={(asset) => setStartFrameAsset(asset)}
                />
              )}
            </div>

            {/* Prompt Input Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prompt {isI2VMode && <span className="text-slate-500 font-normal">(Optional motion instructions)</span>}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isI2VMode
                    ? "Optional camera movement & physics instructions (e.g. 'camera orbits slowly around subject, particles float upward')..."
                    : "Describe the video motion, camera sweep, and subject dynamics..."
                }
                rows={3}
                className="w-full px-3.5 py-2.5 text-xs text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
              />
            </div>

            {/* Duration & Motion Mode Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) as VideoDuration)}
                  className="w-full px-3 py-2 text-xs font-mono text-white bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-accent-indigo"
                >
                  {(activeModel.inputs.supported_durations || [5, 10, 15]).map((d) => (
                    <option key={d} value={d} className="bg-[#0f111a]">
                      {d} Seconds
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full px-3 py-2 text-xs font-mono text-white bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-accent-indigo"
                >
                  {(activeModel.inputs.supported_aspect_ratios || ["16:9", "9:16", "1:1"]).map((r) => (
                    <option key={r} value={r} className="bg-[#0f111a]">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-sm text-black bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-lime rounded-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video ({Math.round(progress * 100)}%)...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Neural Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Video Stage Viewport */}
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
                    onClick={() => downloadMediaAsset(outputVideoUrl, "aether-video.mp4")}
                    className="p-2 rounded-xl bg-accent-cyan text-black hover:bg-accent-cyan/90 transition-all shadow-lg"
                    title="Download MP4"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-accent-indigo/40">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Neural Video Stage</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter motion instructions or upload a start frame to animate with the Motion Brush canvas tool.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Motion Brush Overlay Modal */}
      {isBrushModalOpen && startFrameAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl">
            <MotionBrushCanvas
              backgroundImageUrl={startFrameAsset.uploadedUrl}
              onApplyTrajectory={(maskDataUrl, vec) => {
                setMotionTrajectory({ maskDataUrl, vector: vec });
                setIsBrushModalOpen(false);
              }}
              onCancel={() => setIsBrushModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {outputVideoUrl && (
        <LightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          mediaUrl={outputVideoUrl}
          mediaType="video"
          prompt={prompt}
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
        resolution={`${duration}s`}
        onCancel={handleCancel}
      />
    </div>
  );
}
