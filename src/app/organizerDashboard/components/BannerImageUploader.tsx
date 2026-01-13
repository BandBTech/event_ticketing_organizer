"use client";

import { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X } from "lucide-react"; // Using lucide-react for consistency with other components if available, checking imports
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface BannerImageUploaderProps {
  imagePreview: string;
  imageError: string;
  formError?: string;
  onImageSelect: (file: File) => void;
  onError: (error: string) => void;
  label?: string;
  helperText?: string;
  helperTextSize?: string;
  browseButtonText?: string;
  onRemove?: () => void;
}

const BannerImageUploader = ({
  imagePreview,
  imageError,
  formError,
  onImageSelect,
  onError,
  label = "event.field.bannerImage",
  helperText = "event.field.bannerImageHelperText",
  helperTextSize = "event.field.bannerImageHelperTextSize",
  browseButtonText = "Browse File",
  onRemove,
}: BannerImageUploaderProps) => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasError = !!(imageError || formError);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    noClick: true,
    noKeyboard: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageSelect(file);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection) {
        const error = rejection.errors[0];
        if (error.code === "file-too-large") {
          onError(t("common.image.fileTooLarge", "File size exceeds {size}. Please upload a smaller image.", { size: "5MB" }));
        } else if (error.code === "file-invalid-type") {
          onError(t("common.image.fileInvalidType", "Invalid file type. Please upload an image (PNG/JPG)."));
        } else {
          onError(error.message);
        }
      }
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className={hasError ? "text-red-500" : ""}>{t(label, "Banner Image")}</Label>
      <div
        {...getRootProps()}
        onClick={!imagePreview ? handleClick : undefined}
        className={cn(
          "border-2 border-dashed grow flex flex-col items-center justify-center rounded-lg text-center text-gray-500 transition-colors relative overflow-hidden min-h-[100px]",
          !imagePreview && "cursor-pointer",
          hasError
            ? "border-red-500 bg-red-50/50"
            : isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        {imagePreview ? (
          <div className="relative w-full h-full group">
            <img
              src={imagePreview}
              alt="Banner preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Remove Button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 rounded-full cursor-pointer shadow-sm transition-colors z-20"
            >
              <X className="w-4 h-4 text-red-600" />
            </div>

            {/* Overlay for "Change Image" */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
              onClick={handleClick}
            >
              <div className="text-white space-y-2">
                <p className="font-medium">{t("common.changeImage", "Change Image")}</p>
                <p className="text-xs">{t("common.clickToUpdate", "Click to update")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <ImageIcon className="w-10 h-10 mb-4 opacity-50" />
            {isDragActive ? (
                <p className="text-blue-600 font-medium">{t("common.dropImageHere", "Drop the image here...")}</p>
              ) : (
                <>
                    <p className="font-medium text-sm mb-1">{t(helperText, "Upload banner image or drag & drop")}</p>
                    <span className="text-xs text-muted-foreground mb-4 block max-w-[250px] mx-auto leading-relaxed">
                      {t(helperTextSize, "PNG/JPG file of 1920x1200px with size up to 5MB")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                  }}
                >
                  {browseButtonText}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {/* Error Message */}
      {hasError && (
        <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 p-2 rounded-md border border-red-100">
          {imageError || formError}
        </p>
      )}
    </div>
  );
};

export default BannerImageUploader;
