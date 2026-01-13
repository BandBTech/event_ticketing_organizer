"use client";

import { useRef, useState } from "react";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on other files
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface ImageUploaderProps {
  value?: string; // URL or base64 string of the image
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  error?: string;
  label?: string;
  helperText?: string;
  helperTextSize?: string;
  browseButtonText?: string;
  className?: string;
  maxSizeMB?: number; // Default 5MB
  acceptedFileTypes?: Record<string, string[]>; // Default image/*
  aspectRatio?: number; // Target aspect ratio (width/height)
  aspectRatioTolerance?: number; // Default 0.1
  checkAspectRatio?: boolean; // Whether to validate aspect ratio
  required?: boolean; // Whether to show required asterisk
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  error,
  label = "Image",
  helperText = "Upload image or drag & drop",
  helperTextSize,
  browseButtonText = "Browse File",
  className,
  maxSizeMB = 5,
  acceptedFileTypes = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
  },
  aspectRatio,
  aspectRatioTolerance = 0.1,
  checkAspectRatio = false,
  required = false,
}: ImageUploaderProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string>("");

  const effectiveError = error || internalError;
  const hasError = !!effectiveError;

  const validateImage = (file: File) => {
    setInternalError("");

    if (checkAspectRatio && aspectRatio) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.width;
        const height = img.height;
        const imageAspectRatio = width / height;
        const minAspectRatio = aspectRatio - aspectRatioTolerance;
        const maxAspectRatio = aspectRatio + aspectRatioTolerance;

        if (imageAspectRatio < minAspectRatio || imageAspectRatio > maxAspectRatio) {
          // We might want to just warn or fail. 
          // For now, let's treat it as an error passed to parent or internal error.
          // However, blocking onChange might be too aggressive if we want to let parent handle it.
          // But checking requirements "Validation such as Invalid media file... missing", implies we should block or show error.
          const msg = `Image aspect ratio must be approximately ${aspectRatio.toFixed(2)}.`;
          setInternalError(msg);
          // If strict, we might want to call onChange(null) but usually we let the user see the preview and the error.
          // Let's call onChange(file) but keep the error.
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setInternalError("Failed to load image for validation.");
      };

      img.src = objectUrl;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    noClick: true, // We handle click manually to support "change image" overlay
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setInternalError("");
        if (checkAspectRatio) {
          validateImage(file);
        }
        onChange(file);
      }
    },
    onDropRejected: (fileRejections: FileRejection[]) => {
      const rejection = fileRejections[0];
      if (rejection) {
        const err = rejection.errors[0];
        if (err.code === "file-too-large") {
          const msg = t("common.image.limitExceeded", "File size exceeds the maximum limit of {maxSizeMB}MB.", { maxSizeMB });
          setInternalError(msg);
          toast.error(msg);
        } else if (err.code === "file-invalid-type") {
          const msg = t("common.image.fileInvalidType", "Invalid media file. Please upload a valid image (PNG/JPG).");
          setInternalError(msg);
          toast.error(msg);
        } else {
          // Ensure default error message has a period
          const msg = err.message.endsWith(".") ? err.message : `${err.message}.`;
          setInternalError(msg);
          toast.error(msg);
        }
      }
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError("");

    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onRemove) {
      onRemove();
    } else {
      onChange(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label className={hasError ? "text-red-500" : ""}>{label}{required && <span className="text-red-500"> *</span>}</Label>}

      <div
        {...getRootProps()}
        onClick={!value ? handleClick : undefined}
        className={cn(
          "border-2 border-dashed grow flex flex-col items-center justify-center rounded-lg text-center text-gray-500 transition-colors relative overflow-hidden",
          !value && "cursor-pointer min-h-[100px]",
          hasError
            ? "border-red-500 bg-red-50/50"
            : isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {value ? (
          <div className="relative w-full h-full group min-h-[100px]">
            {/* Using img tag directly for flexibility with blob URLs and simplicity, optimized next/image requires width/height or fill */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg p-1"
            // used object-contain to ensure whole image is seen if aspect ratio differs from container
            />

            {/* Remove Button */}
            <div
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 rounded-full cursor-pointer shadow-sm transition-all hover:scale-110 z-10 text-red-600"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </div>

            {/* Change Image Overlay */}
            <div
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <div className="text-white space-y-2 text-center">
                <p className="font-medium">{t("common.changeImage", "Change Image")}</p>
                <p className="text-xs text-white/80">{t("common.clickToReplace", "Click to replace")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-400 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            {isDragActive ? (
                <p className="text-blue-600 font-medium">{t("common.dropImageHere", "Drop the image here...")}</p>
            ) : (
              <>
                <p className="font-medium text-gray-900 mb-1">{helperText}</p>
                {helperTextSize && <p className="text-xs text-gray-500 mb-2">{helperTextSize}</p>}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="mt-2"
                >
                  {browseButtonText}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {effectiveError && (
        <p className="text-xs font-medium text-destructive">
          {t(effectiveError)}
        </p>
      )}
    </div>
  );
}
