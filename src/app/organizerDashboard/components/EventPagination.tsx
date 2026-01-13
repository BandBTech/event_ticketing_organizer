"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export default function EventPagination({
	currentPage,
	totalPages,
	onPageChange,
	className = "",
}: PaginationProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
	if (totalPages <= 1) return null;

	const goToPrevious = () => {
		if (currentPage > 1) onPageChange(currentPage - 1);
	};

	const goToNext = () => {
		if (currentPage < totalPages) onPageChange(currentPage + 1);
	};

	return (
		<div className={`flex justify-center text-gray-700 items-center gap-2 ${className}`}>
			<button
				onClick={goToPrevious}
				disabled={currentPage === 1}
        className={`flex items-center px-3 py-1 border border-gray-300 rounded-full cursor-pointer disabled:cursor-not-allowed transition-colors ${currentPage === 1
					? "opacity-50 cursor-not-allowed"
					: "hover:bg-gray-50 hover:shadow-sm"
					}`}
			>
				<ArrowLeft className="w-4 h-4 mr-1" />
        {t("common.previous", "Previous")}
			</button>

			{/* Page Numbers */}
			{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
				// Show first page, last page, current page, and pages around current
				const showPage =
					page === 1 ||
					page === totalPages ||
					(page >= currentPage - 1 && page <= currentPage + 1);

				if (!showPage) {
					// Show ellipsis
					if (page === currentPage - 2 || page === currentPage + 2) {
						return (
							<span key={page} className="px-2 text-gray-400">
								...
							</span>
						);
					}
					return null;
				}

				return (
					<button
						key={page}
						onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${currentPage === page
							? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md"
							: "border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
							}`}
					>
						{page}
					</button>
				);
			})}

			<button
				onClick={goToNext}
				disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-1 border border-gray-300 rounded-full cursor-pointer transition-colors ${currentPage === totalPages
					? "opacity-50 cursor-not-allowed"
					: "hover:bg-gray-50 hover:shadow-sm"
					}`}
			>
        {t("common.next", "Next")}
				<ArrowRight className="w-4 h-4 ml-1" />
			</button>
		</div>
	);
}
