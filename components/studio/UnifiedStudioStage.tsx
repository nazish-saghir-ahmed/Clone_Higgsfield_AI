"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Wand2, Mic, MicOff, Download, Maximize2, RefreshCw, Layers, Film, Clapperboard, Music, Video, User, Sliders, ArrowUp, AlertCircle, Compass, Paintbrush, Play, Pause, ChevronDown } from "lucide-react";
import { ReferenceTray } from "@/components/image/ReferenceTray";
import { UploadDropzone } from "@/components/shared/UploadDropzone";
import { FourWheelRig } from "@/components/cinema/FourWheelRig";
import { MotionBrushCanvas } from "@/components/canvas/MotionBrushCanvas";
import { LightboxModal } from "@/components/shared/LightboxModal";
import BorderGlow from "@/components/BorderGlow";
import { CinematicImageHero } from "@/components/hero/CinematicImageHero";
import { STYLE_PRESETS, applyStylePreset, StylePreset } from "@/lib/prompt-compiler";
import { submitGenerativeJob, executePollingLoop } from "@/lib/api-client";
import { normalizeOutputUrl } from "@/lib/url-normalizer";
import { addHistoryItem } from "@/lib/storage";
import { AspectRatio, GenerationHistoryItem, MotionMode, MotionVector, NeuralModelDefinition, Resolution, StudioCategory, UploadedAssetRecord, VideoDuration } from "@/lib/types";
import { downloadMediaAsset } from "@/lib/utils";

interface UnifiedStudioStageProps {
  studioType: "image" | "video" | "lipsync" | "cinema";
  engineBadge: string;
  headlineMain: string;
  headlineEmphasis: string;
  headlineSuffix: string;
  subtitle: string;
  placeholderText: string;
  models: NeuralModelDefinition[];
  defaultModelId: string;
}

export const UnifiedStudioStage: React.FC<UnifiedStudioStageProps> = ({
  studioType,
  engineBadge,
  headlineMain,
  headlineEmphasis,
  headlineSuffix,
  subtitle,
  placeholderText,
  models,
  defaultModelId,
}) => {
  const [selectedModelId, setSelectedModelId] = useState(defaultModelId);
  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Prompt Inputs
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [resolution, setResolution] = useState<Resolution>("1K");
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [motionMode, setMotionMode] = useState<MotionMode>("normal");

  // Media Inputs
  const [referenceImages, setReferenceImages] = useState<UploadedAssetRecord[]>([]);
  const [startFrameAsset, setStartFrameAsset] = useState<UploadedAssetRecord | null>(null);
  const [visualAsset, setVisualAsset] = useState<UploadedAssetRecord | null>(null);
  const [audioAsset, setAudioAsset] = useState<UploadedAssetRecord | null>(null);

  // Cinema compiled prompt
  const [compiledCinemaPrompt, setCompiledCinemaPrompt] = useState("");

  // Motion Brush
  const [isBrushModalOpen, setIsBrushModalOpen] = useState(false);
  const [motionTrajectory, setMotionTrajectory] = useState<{
    maskDataUrl: string;
    vector: MotionVector;
  } | null>(null);

  // Web Speech API
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready for synthesis");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const studioCardRef = useRef<HTMLDivElement>(null);

  // Active Output Viewport
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Initialize Speech Recognition
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

  const toggleSpeech = () => {
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

  const handleGenerate = async () => {
    const finalPrompt = studioType === "cinema" ? compiledCinemaPrompt : prompt;

    if (studioType === "image" && referenceImages.length === 0 && !prompt.trim()) {
      setErrorMessage("Please enter a prompt to generate an image.");
      return;
    }
    if (studioType === "video" && !startFrameAsset && !prompt.trim()) {
      setErrorMessage("Please enter a motion description or upload a start frame.");
      return;
    }
    if (studioType === "lipsync" && (!visualAsset || !audioAsset)) {
      setErrorMessage("Please upload both a portrait visual asset and a speech audio track.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setProgress(0.05);
    setStatusText("Initializing neural engine...");
    setElapsedSeconds(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const payload: any = {
        prompt: finalPrompt || "Neural synthesis render",
        aspect_ratio: aspectRatio,
        resolution: resolution,
        duration: duration,
        mode: motionMode,
      };

      if (studioType === "image" && referenceImages.length > 0) {
        if (activeModel.inputs.imageField === "images_list") {
          payload.images_list = referenceImages.map((r) => r.uploadedUrl);
        } else {
          payload.image_url = referenceImages[0]?.uploadedUrl;
        }
      }

      if (studioType === "video" && startFrameAsset) {
        payload.image_url = startFrameAsset.uploadedUrl;
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
      }

      if (studioType === "lipsync") {
        payload.audio_url = audioAsset?.uploadedUrl;
        if (activeModel.inputs.videoField) {
          payload.video_url = visualAsset?.uploadedUrl;
        } else {
          payload.image_url = visualAsset?.uploadedUrl;
        }
      }

      const submission = await submitGenerativeJob(activeModel.endpoint, payload);
      setStatusText(`Synthesizing (${submission.request_id.substring(0, 8)})...`);

      const result = await executePollingLoop(submission.request_id, {
        intervalMs: 2000,
        signal: abortController.signal,
        onProgress: (status, prog, elapsed) => {
          setStatusText(`Synthesizing (${status})...`);
          setProgress(prog);
          setElapsedSeconds(elapsed);
        },
      });

      const finalUrl = normalizeOutputUrl(result);
      if (!finalUrl) {
        throw new Error("Unable to parse output media URL from gateway response.");
      }

      setOutputUrl(finalUrl);
      setStatusText("Synthesis complete!");
      setProgress(1.0);

      const isVideo = studioType === "video" || studioType === "lipsync" || finalUrl.endsWith(".mp4");
      const historyItem: GenerationHistoryItem = {
        id: `hist_${Date.now()}`,
        requestId: submission.request_id,
        studioType: studioType,
        modelId: activeModel.id,
        modelName: activeModel.name,
        prompt: finalPrompt,
        outputUrl: finalUrl,
        thumbnailUrl: finalUrl,
        mediaType: isVideo ? "video" : "image",
        aspectRatio,
        resolution,
        executionSeconds: elapsedSeconds,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(historyItem);
    } catch (err: any) {
      if (err.message === "ABORTED") {
        setStatusText("Generation canceled.");
      } else {
        console.error("Synthesis error:", err);
        setErrorMessage(err.message || "Synthesis failed.");
        setStatusText("Synthesis failed.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const isVideoOutput = studioType === "video" || studioType === "lipsync" || (outputUrl && outputUrl.endsWith(".mp4"));

  return (
    <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4 pb-20 px-4 sm:px-6 hero-radial-glow overflow-x-hidden">
      {/* Stage 1 & 2: Large Cinematic Hero AI Showcase Carousel for Image Studio */}
      {studioType === "image" && (
        <CinematicImageHero
          onUsePrompt={(loadedPrompt) => {
            setPrompt(loadedPrompt);
            studioCardRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          onScrollToStudio={() => {
            studioCardRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}

      {/* Seamless Transition Light Bridge between Hero and Studio */}
      {studioType === "image" && (
        <div className="w-full h-16 sm:h-24 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none -my-4" />
      )}

      {/* Stage 3: Product Typography & Synthesis Studio Section */}
      <div ref={studioCardRef} className="w-full flex flex-col items-center pt-8 sm:pt-16 pb-6 scroll-mt-16">
        {/* 1. Top Futuristic Engine Pill Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] shadow-lg mb-6 backdrop-blur-md">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-cyan" />
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-200 uppercase font-medium">
            {engineBadge}
          </span>
        </div>

        {/* 2. Large Full-Width Section Title (with Serif Italic Emphasis) */}
        <div className="text-center max-w-5xl mx-auto mb-6 px-4 select-none">
          <h1 className="text-5xl sm:text-7xl lg:text-[84px] font-extrabold tracking-tight text-white leading-[1.08] font-sans">
            {headlineMain}
            <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-slate-100 tracking-normal px-2">
              {headlineEmphasis}
            </span>
            {headlineSuffix}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 3. Main Focused Creation / Input Panel */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
        className="w-full max-w-3xl mt-6 shadow-2xl"
      >
        <div className="w-full p-5 sm:p-6 text-white relative">
          {/* Multiline Textarea Input */}
          <div className="relative mb-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholderText}
            rows={3}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-500 border-none outline-none resize-none leading-relaxed font-sans pr-8"
          />
        </div>

        {/* Studio-Specific Conditioning Extensions inside the Panel */}
        {studioType === "image" && referenceImages.length > 0 && (
          <div className="pt-3 border-t border-white/[0.06] mb-3">
            <ReferenceTray
              selectedAssets={referenceImages}
              maxSlots={activeModel.inputs.maxImages || 14}
              onSelectionChange={(assets) => setReferenceImages(assets)}
            />
          </div>
        )}

        {studioType === "video" && startFrameAsset && (
          <div className="pt-3 border-t border-white/[0.06] mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={startFrameAsset.thumbnail} alt="Frame" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[180px]">{startFrameAsset.name}</p>
                <p className="text-[10px] text-accent-cyan font-mono">Image-to-Video Conditioning Active</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBrushModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-colors"
              >
                <Paintbrush className="w-3.5 h-3.5 text-accent-cyan" />
                <span>{motionTrajectory ? "Edit Brush Trajectory" : "Paint Brush"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartFrameAsset(null);
                  setMotionTrajectory(null);
                }}
                className="text-xs text-slate-400 hover:text-red-400 px-2"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {studioType === "lipsync" && (
          <div className="pt-3 border-t border-white/[0.06] mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 mb-1">Visual Target:</span>
              {visualAsset ? (
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 p-2 rounded-xl">
                  <span className="text-xs text-white truncate">{visualAsset.name}</span>
                  <button onClick={() => setVisualAsset(null)} className="text-xs text-slate-400 hover:text-red-400">×</button>
                </div>
              ) : (
                <UploadDropzone
                  accept="image/*,video/*"
                  maxFiles={1}
                  onAssetUploaded={(a) => setVisualAsset(a)}
                  className="p-2 border-white/10 bg-transparent"
                />
              )}
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-400 mb-1">Audio Track:</span>
              {audioAsset ? (
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 p-2 rounded-xl">
                  <span className="text-xs text-white truncate">{audioAsset.name}</span>
                  <button onClick={() => setAudioAsset(null)} className="text-xs text-slate-400 hover:text-red-400">×</button>
                </div>
              ) : (
                <UploadDropzone
                  accept="audio/*"
                  maxFiles={1}
                  onAssetUploaded={(a) => setAudioAsset(a)}
                  className="p-2 border-white/10 bg-transparent"
                />
              )}
            </div>
          </div>
        )}

        {studioType === "cinema" && (
          <div className="pt-3 border-t border-white/[0.06] mb-3">
            <FourWheelRig
              basePrompt={prompt}
              onCompiledPromptChange={(comp) => setCompiledCinemaPrompt(comp)}
            />
          </div>
        )}

        {/* Bottom Toolbar with Clean Pill Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {/* Left Feature Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Model Selector Pill */}
            <div className="relative">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-full focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0f111a] text-white">
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Optional Image Reference Picker Trigger for Image Studio */}
            {studioType === "image" && (
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.accept = "image/*";
                  input.onchange = async (e: any) => {
                    const files = e.target.files;
                    if (files) {
                      const { uploadMediaFile } = await import("@/lib/api-client");
                      const { generateSquareThumbnail } = await import("@/lib/thumbnail");
                      const newAssets: UploadedAssetRecord[] = [];
                      for (const file of Array.from(files) as File[]) {
                        const thumb = await generateSquareThumbnail(file);
                        const res = await uploadMediaFile(file);
                        newAssets.push({
                          id: `asset_${Date.now()}_${Math.random()}`,
                          name: file.name,
                          uploadedUrl: res.url,
                          thumbnail: thumb,
                          timestamp: new Date().toISOString(),
                        });
                      }
                      setReferenceImages((prev) => [...prev, ...newAssets].slice(0, 14));
                    }
                  };
                  input.click();
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3 h-3 text-accent-cyan" />
                <span>Reference ({referenceImages.length})</span>
              </button>
            )}

            {/* Frame Upload Trigger for Video Studio */}
            {studioType === "video" && !startFrameAsset && (
              <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-colors flex items-center gap-1.5">
                <Film className="w-3 h-3 text-accent-indigo" />
                <span>Add Start Frame</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const { uploadMediaFile } = await import("@/lib/api-client");
                      const { generateSquareThumbnail } = await import("@/lib/thumbnail");
                      const thumb = await generateSquareThumbnail(file);
                      const res = await uploadMediaFile(file);
                      setStartFrameAsset({
                        id: `asset_${Date.now()}`,
                        name: file.name,
                        uploadedUrl: res.url,
                        thumbnail: thumb,
                        timestamp: new Date().toISOString(),
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}

            {/* Aspect Ratio Selector */}
            {activeModel.inputs.aspect_ratio && (
              <div className="relative">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="appearance-none pl-3 pr-6 py-1.5 text-xs font-mono text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-full focus:outline-none cursor-pointer"
                >
                  {(activeModel.inputs.supported_aspect_ratios || ["16:9", "9:16", "1:1"]).map((r) => (
                    <option key={r} value={r} className="bg-[#0f111a]">
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Duration Selector for Video */}
            {activeModel.inputs.duration && (
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) as VideoDuration)}
                  className="appearance-none pl-3 pr-6 py-1.5 text-xs font-mono text-slate-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-full focus:outline-none cursor-pointer"
                >
                  {(activeModel.inputs.supported_durations || [5, 10]).map((d) => (
                    <option key={d} value={d} className="bg-[#0f111a]">
                      {d}s
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Right Action: Voice Dictation + Glowing Action Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
              title="Voice Dictation"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-[#ec4899] to-[#f43f5e] hover:opacity-95 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all active:scale-95 disabled:opacity-50"
              title="Generate / Create"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        </div>
      </BorderGlow>

      {/* 4. Minimal Telemetry / Status Line beneath the Input Card */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 text-[11px] font-mono text-slate-500 text-center">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          Aether Neural Engine Online
        </span>
        <span className="text-slate-600">/</span>
        <span>Optical Flow: 120 FPS</span>
        <span className="text-slate-600">/</span>
        <span>Resolution: {resolution}</span>
        <span className="text-slate-600">/</span>
        <span className="text-accent-cyan/90 font-medium">Ready for Synthesis</span>
      </div>
      </div>

      {/* 5. Active Output Showcase Viewport */}
      {outputUrl && (
        <div className="w-full max-w-4xl mt-10 studio-glass-panel p-6 flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative group max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center">
            {isVideoOutput ? (
              <video
                src={outputUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[65vh] w-auto rounded-2xl"
              />
            ) : (
              <img
                src={outputUrl}
                alt="Aether Neural Render"
                className="max-h-[65vh] w-auto rounded-2xl object-contain"
              />
            )}

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-colors shadow-lg border border-white/10"
                title="Zoom Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-accent-cyan" />
              </button>
              <button
                onClick={() => downloadMediaAsset(outputUrl, isVideoOutput ? "aether-video.mp4" : "aether-render.png")}
                className="p-2.5 rounded-xl bg-accent-cyan text-black hover:bg-accent-cyan/90 transition-colors shadow-lg font-bold"
                title="Download 4K Media"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Motion Brush Overlay */}
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
      {outputUrl && (
        <LightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          mediaUrl={outputUrl}
          mediaType={isVideoOutput ? "video" : "image"}
          prompt={studioType === "cinema" ? compiledCinemaPrompt : prompt}
          modelName={activeModel.name}
        />
      )}
    </div>
  );
};
