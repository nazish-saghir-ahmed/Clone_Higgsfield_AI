import { MotionVector } from "./types";

export function computeMotionVector(angleDegrees: number, intensity: number): MotionVector {
  const rad = (angleDegrees * Math.PI) / 180;
  const clampedIntensity = Math.max(1, Math.min(10, intensity));
  const factor = clampedIntensity / 10.0;

  const dx = parseFloat((Math.cos(rad) * factor).toFixed(3));
  const dy = parseFloat((Math.sin(rad) * factor).toFixed(3));

  return {
    angleDegrees,
    dx,
    dy,
    intensity: clampedIntensity,
  };
}

export function exportBinaryMaskDataUrl(
  sourceCanvas: HTMLCanvasElement,
  targetWidth?: number,
  targetHeight?: number
): string {
  const w = targetWidth || sourceCanvas.width;
  const h = targetHeight || sourceCanvas.height;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = w;
  outputCanvas.height = h;
  const ctx = outputCanvas.getContext("2d");
  if (!ctx) return "";

  // 1. Fill pure black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  // 2. Draw source mask as pure white
  ctx.drawImage(sourceCanvas, 0, 0, w, h);

  // 3. Convert non-transparent pixels to pure white
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 10) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // Alpha
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  return outputCanvas.toDataURL("image/png");
}

export function drawDirectionalArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  angleDegrees: number,
  length = 28,
  color = "#00dbe9"
): void {
  const rad = (angleDegrees * Math.PI) / 180;
  const toX = fromX + Math.cos(rad) * length;
  const toY = fromY + Math.sin(rad) * length;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  // Main arrow line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  const headLen = 8;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(rad - Math.PI / 6),
    toY - headLen * Math.sin(rad - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(rad + Math.PI / 6),
    toY - headLen * Math.sin(rad + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
