"use client";

import { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
}

const BannerImageUploader = ({
	imagePreview,
	imageError,
	formError,
	onImageSelect,
	onError,
	label = "Banner Image",
	helperText = "Upload banner image or drag & drop",
	helperTextSize = "PNG/JPG file of 1920x1200px with size up to 5MB",
	browseButtonText = "Browse File",
}: BannerImageUploaderProps) => {
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
					onError("File size exceeds 5MB. Please upload a smaller image.");
				} else if (error.code === "file-invalid-type") {
					onError("Invalid file type. Please upload an image (PNG/JPG).");
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
			<Label className={hasError ? "text-red-500" : ""}>{label}</Label>
			<div
				{...getRootProps()}
				onClick={handleClick}
				className={cn(
					"border-2 border-dashed grow flex flex-col items-center justify-center rounded-lg text-center text-gray-500 cursor-pointer transition-colors relative overflow-hidden",
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
						<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<div className="text-white space-y-2">
								<p className="font-medium">Change Image</p>
								<p className="text-xs">Click or drag to update</p>
							</div>
						</div>
					</div>
				) : (
					<>
						<ImageIcon weight="duotone" className="w-6 h-6 mb-2" />
						{isDragActive ? (
							<p className="text-blue-600 font-medium">Drop the image here...</p>
						) : (
							<>
								<p>{helperText}</p>
								<span className="text-xs">{helperTextSize}</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										fileInputRef.current?.click();
									}}
									className="mt-2"
								>
									{browseButtonText}
								</Button>
							</>
						)}
					</>
				)}
				{hasError && (
					<p className="text-red-500 text-xs mt-1 absolute bottom-2 left-0 right-0">
						{imageError || formError}
					</p>
				)}
			</div>
		</div>
	);
};

export default BannerImageUploader;
