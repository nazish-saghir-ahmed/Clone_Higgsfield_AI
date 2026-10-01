export type StudioCategory = 
  | "t2i" 
  | "i2i" 
  | "t2v" 
  | "i2v" 
  | "lipsync" 
  | "cinema" 
  | "utility";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
export type Resolution = "480p" | "720p" | "1080p" | "1K" | "2K" | "4K";
export type Quality = "basic" | "high" | "extreme";
export type VideoDuration = 5 | 10 | 15;
export type MotionMode = "normal" | "fun" | "spicy" | "high";

export interface ModelInputConstraints {
  prompt: boolean;
  promptOptional?: boolean;
  negative_prompt?: boolean;
  aspect_ratio?: boolean;
  supported_aspect_ratios?: AspectRatio[];
  resolution?: boolean;
  supported_resolutions?: Resolution[];
  quality?: boolean;
  supported_qualities?: Quality[];
  duration?: boolean;
  supported_durations?: VideoDuration[];
  mode?: boolean;
  supported_modes?: MotionMode[];
  imageField?: "image_url" | "images_list" | "source_image" | "input_image";
  maxImages?: number;
  audioField?: "audio_url" | "audio_file";
  videoField?: "video_url" | "source_video";
}

export interface NeuralModelDefinition {
  id: string;
  name: string;
  developer: string;
  endpoint: string;
  category: StudioCategory;
  description: string;
  badge?: "PRO" | "FAST" | "HD" | "NEW" | "EXPERIMENTAL";
  inputs: ModelInputConstraints;
  defaultParams?: Record<string, any>;
}

export interface JobSubmissionPayload {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: AspectRatio;
  resolution?: Resolution;
  quality?: Quality;
  duration?: VideoDuration;
  mode?: MotionMode;
  image_url?: string;
  images_list?: string[];
  audio_url?: string;
  video_url?: string;
  motion_trajectories?: Array<{
    mask_url: string;
    dx: number;
    dy: number;
    intensity: number;
  }>;
  [key: string]: any;
}

export type JobStatus = 
  | "starting"
  | "queued"
  | "processing"
  | "completed"
  | "succeeded"
  | "failed"
  | "error";

export interface PollingResponse {
  request_id: string;
  status: JobStatus;
  progress?: number;
  execution_time_seconds?: number;
  outputs?: any[];
  output?: any;
  url?: string;
  result?: any;
  error?: string;
  message?: string;
  created_at?: string;
  completed_at?: string;
}

export interface UploadedAssetRecord {
  id: string;
  name: string;
  uploadedUrl: string;
  thumbnail: string;
  timestamp: string;
  fileSize?: number;
  mimeType?: string;
}

export interface PendingJobRecord {
  requestId: string;
  modelId: string;
  studioType: "image" | "video" | "lipsync" | "cinema";
  prompt: string;
  startedAt: string;
  payload: Record<string, any>;
}

export interface GenerationHistoryItem {
  id: string;
  requestId: string;
  studioType: "image" | "video" | "lipsync" | "cinema";
  modelId: string;
  modelName: string;
  prompt: string;
  outputUrl: string;
  thumbnailUrl?: string;
  mediaType: "image" | "video";
  aspectRatio?: string;
  resolution?: string;
  duration?: number;
  executionSeconds?: number;
  timestamp: string;
}

export interface MotionVector {
  angleDegrees: number;
  dx: number;
  dy: number;
  intensity: number;
}

export interface MotionBrushLayer {
  id: string;
  name: string;
  colorHex: string;
  vector: MotionVector;
  maskDataUrl?: string;
}

export interface CinemaRigConfig {
  prompt: string;
  camera: string;
  lens: string;
  focalLength: number;
  aperture: string;
}
