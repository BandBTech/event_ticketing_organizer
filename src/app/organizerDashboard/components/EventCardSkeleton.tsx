"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface EventCardSkeletonProps {
	count?: number;
}

export default function EventCardSkeleton({ count = 6 }: EventCardSkeletonProps) {
	return (
		<>
			{[...Array(count)].map((_, i) => (
				<div
					key={i}
					className="rounded-xl shadow-md overflow-hidden flex flex-col h-full bg-white"
				>
					<Skeleton className="h-40 w-full" />
					<div className="p-4 space-y-1 flex flex-col flex-1">
						<div className="flex gap-2">
							<Skeleton className="h-6 w-16 rounded-lg" />
							<Skeleton className="h-6 w-16 rounded-lg" />
						</div>
						<Skeleton className="h-6 mb-1 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-1/2" />
						<div className="mt-auto">
							<div className="my-4 border-t border-gray-100" />
							<div className="flex justify-between">
								<Skeleton className="h-9 w-24 rounded-lg" />
								<Skeleton className="h-9 w-9 rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			))}
		</>
	);
}
