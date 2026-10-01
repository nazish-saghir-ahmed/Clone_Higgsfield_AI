/**
 * In-browser canvas thumbnail generator producing 80x80 center-cropped JPEG data URLs.
 */
export async function generateSquareThumbnail(file: File, size = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    // If audio file or non-image, create standard waveform placeholder
    if (file.type.startsWith("audio/")) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");

      ctx.fillStyle = "#0f111a";
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "#00dbe9";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < size; i += 6) {
        const h = (Math.sin(i * 0.2) + 1.2) * 15;
        ctx.moveTo(i, size / 2 - h / 2);
        ctx.lineTo(i, size / 2 + h / 2);
      }
      ctx.stroke();
      return resolve(canvas.toDataURL("image/jpeg", 0.85));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas 2D context unavailable"));

        // Center-crop calculation
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Failed to load image for thumbnail generation"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
