export interface R2UploadedImage {
  key: string;
}

export async function uploadImageToR2(
  file: File,
  productId: string,
  position: number,
): Promise<R2UploadedImage> {
  const response = await fetch("/api/storage/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      contentType: file.type,
      position,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || "Failed to create R2 upload URL");
  }

  const { uploadUrl, key } = await response.json();

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload image to R2 (${uploadResponse.status})`);
  }

  return { key };
}
