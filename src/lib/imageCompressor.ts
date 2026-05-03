export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;

  if (width <= maxWidth && height <= maxHeight && file.size < 300 * 1024) {
    bitmap.close();
    return file;
  }

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

  const newName = file.name.replace(/\.[^.]+$/, ".jpeg");
  return new File([blob], newName, { type: "image/jpeg" });
}
