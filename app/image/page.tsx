"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Wand2, Mic, MicOff, Download, Maximize2, RefreshCw, Layers, ShieldCheck, AlertCircle } from "lucide-react";
import { T2I_MODELS, I2I_MODELS, getModelById } from "@/lib/registry";
import { ReferenceTray } from "@/components/image/ReferenceTray";
import { STYLE_PRESETS, applyStylePreset, StylePreset } from "@/lib/prompt-compiler";
import { submitGenerativeJob, executePollingLoop } from "@/lib/api-client";
import { normalizeOutputUrl } from "@/lib/url-normalizer";
import { addHistoryItem, getApiKey } from "@/lib/storage";
import { TelemetryFooter } from "@/components/layout/TelemetryFooter";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { AspectRatio, GenerationHistoryItem, Resolution, UploadedAssetRecord } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

export default function ImageStudioPage() {
  // State Machine: Selected Reference Images
  const [selectedReferences, setSelectedReferences] = useState<UploadedAssetRecord[]>([]);

  // Derived Dual-Mode: T2I vs I2I
  const isI2IMode = selectedReferences.length > 0;
  const availableModels = isI2IMode ? I2I_MODELS : T2I_MODELS;

  // Active Model State
  const [selectedModelId, setSelectedModelId] = useState<string>(
    isI2IMode ? "nano-banana-2-edit" : "flux-dev"
  );

  // Synchronize model when mode switches
  useEffect(() => {
    if (isI2IMode) {
      if (!I2I_MODELS.some((m) => m.id === selectedModelId)) {
        setSelectedModelId("nano-banana-2-edit");
      }
    } else {
      if (!T2I_MODELS.some((m) => m.id === selectedModelId)) {
        setSelectedModelId("flux-dev");
      }
    }
  }, [isI2IMode]);

  const activeModel = getModelById(selectedModelId) || availableModels[0];

  // Form Inputs
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [resolution, setResolution] = useState<Resolution>("1K");

  // Web Speech API State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready for synthesis");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Output Viewport
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Web Speech Recognition Initialization
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleApplyPreset = (preset: StylePreset) => {
    setPrompt((prev) => applyStylePreset(prev, preset));
    if (preset.negativePrompt && !negativePrompt) {
      setNegativePrompt(preset.negativePrompt);
    }
  };

  const handleGenerate = async () => {
    // Validate inputs
    if (!isI2IMode && !prompt.trim()) {
      setErrorMessage("Text prompt is mandatory for Text-to-Image generation.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setProgress(0.05);
    setStatusText("Initializing neural job...");
    setElapsedSeconds(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build submission payload
      const payload: any = {
        prompt: prompt.trim() || (isI2IMode ? "Style and composition transfer" : ""),
        negative_prompt: negativePrompt.trim() || undefined,
        aspect_ratio: aspectRatio,
        resolution: resolution,
      };

      // Add image conditioning fields
      if (isI2IMode) {
        if (activeModel.inputs.imageField === "images_list") {
          payload.images_list = selectedReferences.map((r) => r.uploadedUrl);
        } else {
          payload.image_url = selectedReferences[0]?.uploadedUrl;
        }
      }

      // Step 1: Submit to Gateway
      const submission = await submitGenerativeJob(activeModel.endpoint, payload);
      setStatusText(`Job submitted (${submission.request_id.substring(0, 10)}...)`);

      // Step 2: Poll status loop
      const result = await executePollingLoop(submission.request_id, {
        intervalMs: 2000,
        signal: abortController.signal,
        onProgress: (status, prog, elapsed) => {
          setStatusText(`Synthesizing (${status})...`);
          setProgress(prog);
          setElapsedSeconds(elapsed);
        },
      });

      // Step 3: Extract and normalize output URL
      const finalUrl = normalizeOutputUrl(result);
      if (!finalUrl) {
        throw new Error("Unable to parse output image URL from response.");
      }

      setOutputUrl(finalUrl);
      setStatusText("Generation complete!");
      setProgress(1.0);

      // Step 4: Persist to History
      const historyItem: GenerationHistoryItem = {
        id: `hist_${Date.now()}`,
        requestId: submission.request_id,
        studioType: "image",
        modelId: activeModel.id,
        modelName: activeModel.name,
        prompt: prompt.trim(),
        outputUrl: finalUrl,
        thumbnailUrl: finalUrl,
        mediaType: "image",
        aspectRatio: aspectRatio,
        resolution: resolution,
        executionSeconds: elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(historyItem);
    } catch (err: any) {
      if (err.message === "ABORTED") {
        setStatusText("Generation canceled by user.");
      } else {
        console.error("Generation error:", err);
        setErrorMessage(err.message || "Generative synthesis failed.");
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
      {/* Studio Workspace Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl w-full mx-auto">
        {/* Left Controls Panel */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4">
          <div className="glass-panel p-5 space-y-4">
            {/* Mode & Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent-cyan" /> Neural Model
                </label>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  isI2IMode ? "bg-accent-indigo/20 text-accent-indigo" : "bg-accent-cyan/20 text-accent-cyan"
                }`}>
                  {isI2IMode ? "I2I Reference Mode" : "T2I Direct Mode"}
                </span>
              </div>

              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all cursor-pointer"
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

            {/* 14-Slot Multi-Image Reference Tray */}
            <ReferenceTray
              selectedAssets={selectedReferences}
              maxSlots={activeModel.inputs.maxImages || 14}
              onSelectionChange={(assets) => setSelectedReferences(assets)}
            />

            {/* Prompt Input Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Prompt {isI2IMode && <span className="text-slate-500 font-normal">(Optional guidance)</span>}
                </label>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    isListening
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice Dictation"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isI2IMode
                    ? "Optional guidance instructions (e.g. 'blend style from image 1 with character in image 2')..."
                    : "Describe the image you want to generate in rich cinematographic detail..."
                }
                rows={4}
                className="w-full px-3.5 py-2.5 text-xs text-white bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
              />
            </div>

            {/* Style Preset Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Cinematic Style Enhancers
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-accent-cyan border border-white/10 rounded-lg transition-all"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Resolution Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full px-3 py-2 text-xs font-mono text-white bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan"
                >
                  {(activeModel.inputs.supported_aspect_ratios || ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"]).map(
                    (ratio) => (
                      <option key={ratio} value={ratio} className="bg-[#0f111a]">
                        {ratio}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                  className="w-full px-3 py-2 text-xs font-mono text-white bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-accent-cyan"
                >
                  {(activeModel.inputs.supported_resolutions || ["1K", "2K", "4K"]).map((res) => (
                    <option key={res} value={res} className="bg-[#0f111a]">
                      {res}
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-display font-bold text-sm text-black bg-gradient-to-r from-accent-cyan via-accent-indigo to-accent-lime rounded-xl hover:shadow-[0_0_25px_rgba(0,219,233,0.4)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing ({Math.round(progress * 100)}%)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Neural Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Stage Viewport */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="glass-panel w-full h-full min-h-[480px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {outputUrl ? (
              <div className="relative group max-w-full max-h-[70vh] flex flex-col items-center">
                <img
                  src={outputUrl}
                  alt={prompt || "Aether Output"}
                  className="max-w-full max-h-[65vh] rounded-xl shadow-2xl object-contain border border-white/10"
                />

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface/90 text-white border border-white/10 hover:bg-white/20 transition-all font-semibold text-xs shadow-lg"
                  >
                    <Maximize2 className="w-4 h-4 text-accent-cyan" />
                    <span>Zoom Lightbox</span>
                  </button>
                  <button
                    onClick={() => downloadMediaAsset(outputUrl, "aether-render.png")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-cyan text-black hover:bg-accent-cyan/90 transition-all font-semibold text-xs shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 4K</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-accent-cyan/40">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Neural Image Stage</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Configure your prompt or select reference images in the tray, then click Generate to synthesize high-fidelity frames.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {outputUrl && (
        <LightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          mediaUrl={outputUrl}
          mediaType="image"
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
        resolution={resolution}
        onCancel={handleCancel}
      />
    </div>
  );
}
