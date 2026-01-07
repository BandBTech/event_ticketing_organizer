"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface UseImageUploadOptions {
  initialPreview?: string;
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreview: string;
  imageError: string;
  imageRemoved: boolean;
  validateAndProcessImage: (file: File) => void;
  handleRemoveImage: () => void;
  resetImage: (preview?: string) => void;
  setImagePreview: (preview: string) => void;
}

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1200;

/**
 * Hook to handle image upload with validation.
 * Validates file type, size, and dimensions.
 */
export function useImageUpload({
  initialPreview = "",
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  maxWidth = DEFAULT_MAX_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialPreview);
  const [imageError, setImageError] = useState<string>("");
  const [imageRemoved, setImageRemoved] = useState(false);

  const clearImageState = useCallback(() => {
    setImageFile(null);
    setImagePreview("");
    setImageRemoved(true);
  }, []);

  const validateAndProcessImage = useCallback(
    (file: File) => {
      setImageError("");

      // Validate file type
      if (!file.type.startsWith("image/")) {
        clearImageState();
        setImageError(
          t("event.error.invalidImageType", "Invalid file type. Please upload an image (PNG/JPG).")
        );
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        clearImageState();
        setImageError(
          `File size exceeds ${Math.round(maxSizeBytes / 1024 / 1024)}MB. Please upload a smaller image.`
        );
        return;
      }

      // Validate dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const width = img.width;
        const height = img.height;

        if (width > maxWidth || height > maxHeight) {
          clearImageState();
          setImageError(
            t(
              "event.error.invalidImageSize",
              `Image dimensions exceed the maximum allowed (${maxWidth}x${maxHeight}px).`,
              { maxWidth, maxHeight }
            )
          );
          return;
        }

        // Valid image - set file and create preview
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          setImageError("");
          setImageRemoved(false);
        };
        reader.readAsDataURL(file);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        clearImageState();
        setImageError("Failed to load image. Please try another file.");
      };

      img.src = objectUrl;
    },
    [t, maxSizeBytes, maxWidth, maxHeight, clearImageState]
  );

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    setImageRemoved(true);
  }, []);

  const resetImage = useCallback((preview?: string) => {
    setImageFile(null);
    setImagePreview(preview || "");
    setImageError("");
    setImageRemoved(false);
  }, []);

  return {
    imageFile,
    imagePreview,
    imageError,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
    resetImage,
    setImagePreview,
  };
}
