export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const MAX_DIMENSION = 1200;

/**
 * Shrinks a photo in the browser before upload. Phone photos are often 4000px and 5MB+,
 * which is far more than a pet card needs, so this saves upload time and disk space.
 */
export async function resizeImage(file: File, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );

  // Older Safari can't encode WebP and quietly hands back a PNG, so fall back to JPEG there.
  if (!blob || blob.type !== "image/webp") {
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (jpeg) => (jpeg ? resolve(jpeg) : reject(new Error("Couldn't process this image."))),
        "image/jpeg",
        quality,
      ),
    );
  }

  return blob;
}
