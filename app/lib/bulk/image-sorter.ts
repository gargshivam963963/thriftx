/**
 * image-sorter.ts
 *
 * Smart image sorting and auto-labeling for bulk uploads.
 * Sorts images by filename (natural numeric) or EXIF capture time.
 * Auto-assigns labels: 1st=Front, 2nd=Back, 3rd=Brand Tag, 4th=Size Tag, 5th=Fabric, 6th=Defect
 */

export type ImageLabel =
  | "Front"
  | "Back"
  | "Brand Tag"
  | "Size Tag"
  | "Fabric"
  | "Defect"
  | (string & {});

const LABEL_ORDER: ImageLabel[] = [
  "Front",
  "Back",
  "Brand Tag",
  "Size Tag",
  "Fabric",
  "Defect",
];

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

/**
 * Get labels for the first `count` images based on position.
 */
export function getImageLabels(count: number): ImageLabel[] {
  return LABEL_ORDER.slice(0, count);
}

/**
 * Get a single label for an image at the given index (0-based).
 */
export function getLabelAtIndex(index: number): ImageLabel {
  return LABEL_ORDER[index] ?? `Image ${index + 1}`;
}

/**
 * Natural numeric sort on filenames.
 * Handles: IMG_001.jpg, IMG_002.jpg ... or TX001-1.png, TX001-2.png
 */
export function sortByFilename(files: File[]): File[] {
  return [...files].sort((a, b) => {
    const aName = a.name.replace(/\.[^.]+$/, "");
    const bName = b.name.replace(/\.[^.]+$/, "");

    // Try numeric extraction for natural sort
    const aNums = aName.match(/\d+/g);
    const bNums = bName.match(/\d+/g);

    if (aNums && bNums && aNums.length > 0 && bNums.length > 0) {
      // Compare using the last numeric group (usually the sequence number)
      const aLast = parseInt(aNums[aNums.length - 1], 10);
      const bLast = parseInt(bNums[bNums.length - 1], 10);
      if (aLast !== bLast) return aLast - bLast;
    }

    // Fallback to locale compare with numeric sensitivity
    return aName.localeCompare(bName, undefined, { numeric: true });
  });
}

/**
 * Read EXIF DateTimeOriginal from a JPEG file and return the date.
 * For non-JPEG files or if EXIF is unavailable, returns null.
 */
async function readExifDate(file: File): Promise<Date | null> {
  // Only JPEG has EXIF DateTimeOriginal typically
  const name = file.name.toLowerCase();
  if (!name.endsWith(".jpg") && !name.endsWith(".jpeg")) {
    return null;
  }

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Check JPEG SOI marker
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

    let offset = 2;

    while (offset < bytes.length - 1) {
      // Find next marker
      if (bytes[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = bytes[offset + 1];

      // SOS marker - no more metadata
      if (marker === 0xda) break;

      // APP1 marker (EXIF)
      if (marker === 0xe1 && offset + 8 < bytes.length) {
        // Check for "Exif\0\0"
        if (
          bytes[offset + 2] === 0x45 && // E
          bytes[offset + 3] === 0x78 && // x
          bytes[offset + 4] === 0x69 && // i
          bytes[offset + 5] === 0x66 && // f
          bytes[offset + 6] === 0x00 &&
          bytes[offset + 7] === 0x00
        ) {
          // Parse TIFF header
          let tiffOffset = offset + 8;
          const endian = String.fromCharCode(
            bytes[tiffOffset],
            bytes[tiffOffset + 1],
          );
          const littleEndian = endian === "II";

          const readShort = (addr: number) => {
            return littleEndian
              ? view.getUint16(addr, true)
              : view.getUint16(addr, false);
          };

          const readLong = (addr: number) => {
            return littleEndian
              ? view.getUint32(addr, true)
              : view.getUint32(addr, false);
          };

          // Skip to IFD0
          const ifd0Offset = readLong(tiffOffset + 4);
          const ifd0 = tiffOffset + ifd0Offset;

          const numEntries = readShort(ifd0);
          for (let i = 0; i < numEntries; i++) {
            const entry = ifd0 + 2 + i * 12;
            const tag = readShort(entry);

            // DateTimeOriginal = 0x9003
            if (tag === 0x9003) {
              // Type is ASCII (2), count is usually 20
              const dataOffset = readLong(entry + 8);
              const strOffset = tiffOffset + dataOffset;

              // Format: "YYYY:MM:DD HH:MM:SS"
              const year =
                String.fromCharCode(bytes[strOffset]) +
                String.fromCharCode(bytes[strOffset + 1]) +
                String.fromCharCode(bytes[strOffset + 2]) +
                String.fromCharCode(bytes[strOffset + 3]);
              const month =
                String.fromCharCode(bytes[strOffset + 5]) +
                String.fromCharCode(bytes[strOffset + 6]);
              const day =
                String.fromCharCode(bytes[strOffset + 8]) +
                String.fromCharCode(bytes[strOffset + 9]);
              const hour =
                String.fromCharCode(bytes[strOffset + 11]) +
                String.fromCharCode(bytes[strOffset + 12]);
              const min =
                String.fromCharCode(bytes[strOffset + 14]) +
                String.fromCharCode(bytes[strOffset + 15]);
              const sec =
                String.fromCharCode(bytes[strOffset + 17]) +
                String.fromCharCode(bytes[strOffset + 18]);

              const dateStr = `${year}-${month}-${day}T${hour}:${min}:${sec}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) return date;
            }
          }
        }
      }

      // Skip to next marker
      const segSize = view.getUint16(offset + 2, false);
      offset += 2 + segSize;
    }
  } catch {
    // Silently fail — EXIF reading is best-effort
  }

  return null;
}

/**
 * Sort files by EXIF DateTimeOriginal (capture time).
 * Files without EXIF dates are sorted by filename as fallback.
 */
export async function sortByExifDate(files: File[]): Promise<File[]> {
  const withDates = await Promise.all(
    files.map(async (file) => ({
      file,
      date: await readExifDate(file),
    })),
  );

  return withDates
    .sort((a, b) => {
      // Files with dates come first
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;

      // Fallback to filename sort
      return a.file.name.localeCompare(b.file.name, undefined, {
        numeric: true,
      });
    })
    .map((item) => item.file);
}

/**
 * Auto-detect the best sort method for a set of files.
 * - If filenames contain sequential numbers → sortByFilename (fast, sync)
 * - Otherwise → sortByExifDate (slower, async, needs EXIF parsing)
 *
 * Returns sync if filename sort is sufficient, otherwise async promise.
 */
export function autoDetectSort(
  files: File[],
): { sync: true; files: File[] } | { sync: false; promise: Promise<File[]> } {
  // Check if filenames contain sequential numbers
  const filenames = files.map((f) => f.name.replace(/\.[^.]+$/, ""));
  const hasNumericSeq = filenames.some((name) => /\d+/.test(name));

  // Also check for iPhone/WhatsApp common patterns
  const isIPhone = filenames.some(
    (name) =>
      name.startsWith("IMG_") ||
      name.startsWith("IMG-") ||
      name.startsWith("Photo"),
  );
  const isWhatsApp = filenames.some(
    (name) =>
      name.includes("WA") || name.startsWith("IMG-") || name.startsWith("P"),
  );

  // If we can detect numeric patterns, use filename sort
  if (hasNumericSeq || isIPhone || isWhatsApp) {
    return { sync: true, files: sortByFilename(files) };
  }

  // Otherwise try EXIF
  return {
    sync: false,
    promise: sortByExifDate(files),
  };
}

/**
 * Quick check: does this filename look like it's from a phone/WhatsApp?
 */
function isPhoneSnapshot(filename: string): boolean {
  const name = filename.replace(/\.[^.]+$/, "").toLowerCase();
  return (
    name.startsWith("img_") ||
    name.startsWith("img-") ||
    name.startsWith("photo_") ||
    name.includes("whatsapp") ||
    name.includes("wa_") ||
    name.startsWith("p_") ||
    name.startsWith("received_")
  );
}

/**
 * Detect if files are likely from a phone (WhatsApp/iPhone) based on naming patterns.
 */
export function isPhoneSource(files: File[]): boolean {
  if (files.length === 0) return false;
  const phoneCount = files.filter((f) => isPhoneSnapshot(f.name)).length;
  return phoneCount / files.length > 0.5;
}

/**
 * Check if an image is likely a defect/closeup based on filename clues.
 * (e.g., "defect", "damage", "stain", "hole" in filename)
 */
export function isDefectImage(filename: string): boolean {
  const name = filename.replace(/\.[^.]+$/, "").toLowerCase();
  return (
    name.includes("defect") ||
    name.includes("damage") ||
    name.includes("stain") ||
    name.includes("hole") ||
    name.includes("flaw") ||
    name.includes("imperfection") ||
    name.includes("tear") ||
    name.includes("mark")
  );
}
