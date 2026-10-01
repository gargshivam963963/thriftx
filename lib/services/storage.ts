"use client";

export interface UploadedImage {
  fileId: string;
  url: string;
}

export async function uploadImages(images: File[]): Promise<UploadedImage[]> {
  return Promise.all(
    images.map(async (image, index) => {
      const response = await fetch("/api/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: image.name || `image-${index + 1}`,
          contentType: image.type || "image/jpeg",
          productId: "legacy",
          position: index,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image upload URL");
      }

      const { uploadUrl, key } = await response.json();
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": image.type || "image/jpeg" },
        body: image,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to storage");
      }

      return {
        fileId: key,
        url: key,
      };
    }),
  );
}

export async function uploadBlobs(
  blobs: Blob[],
  mimeType = "image/jpeg",
): Promise<UploadedImage[]> {
  const files = blobs.map(
    (blob, i) =>
      new File([blob], `image-${i + 1}.${mimeType.split("/")[1] || "jpg"}`, {
        type: blob.type || mimeType,
      }),
  );
  return uploadImages(files);
}

export function extractFileIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/(?:\/|%2F)([A-Za-z0-9_-]+)(?:\?|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function deleteImageFromStorage(
  imageUrl: string,
): Promise<boolean> {
  try {
    const fileId = extractFileIdFromUrl(imageUrl);
    if (!fileId) return false;
    await fetch("/api/storage/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileId }),
    });
    return true;
  } catch {
    return false;
  }
}
