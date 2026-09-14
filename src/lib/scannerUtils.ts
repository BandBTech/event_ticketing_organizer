export interface DetectedBarcodeLike {
  format?: string;
  rawValue?: string;
}

/**
 * Validates whether a detected barcode event represents a legitimate QR code.
 * Rejects:
 * - non-object or null/undefined inputs
 * - barcodes where format is specified and is NOT a QR format (e.g. code_128, ean_13, aztec, text, etc.)
 * - missing or empty/whitespace-only rawValue
 * - regular prose text / non-QR patterns (multi-line text, sentences with spaces that aren't valid JSON)
 */
export function isValidQRCode(item: unknown): item is DetectedBarcodeLike {
  if (!item || typeof item !== "object") {
    return false;
  }
  const barcode = item as DetectedBarcodeLike;
  if (typeof barcode.rawValue !== "string") {
    return false;
  }
  const rawValue = barcode.rawValue.trim();
  if (!rawValue) {
    return false;
  }

  // Constrain format strictly to QR code if format is present
  if (barcode.format !== undefined && barcode.format !== null) {
    if (typeof barcode.format !== "string") {
      return false;
    }
    const fmt = barcode.format.trim().toLowerCase().replace(/[-_]/g, "");
    const isQRFormat =
      fmt === "qrcode" ||
      fmt === "qr" ||
      fmt === "microqrcode" ||
      fmt === "rmqrcode" ||
      fmt.endsWith("qrcode");
    if (!isQRFormat) {
      return false;
    }
  }

  // If the value contains whitespace (spaces, tabs, newlines), it cannot be plain prose or random text.
  // Only valid structured JSON objects/arrays are permitted to contain whitespace.
  if (/\s/.test(rawValue)) {
    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed || typeof parsed !== "object") {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the first valid QR code string from an array of detected barcode items.
 * Returns null if no valid QR code item is found.
 */
export function extractValidQRCode(result: unknown): string | null {
  if (!Array.isArray(result) || result.length === 0) {
    return null;
  }
  const match = result.find(isValidQRCode);
  if (!match || typeof match.rawValue !== "string") {
    return null;
  }
  const trimmed = match.rawValue.trim();
  return trimmed || null;
}
