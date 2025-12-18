"use client";

import { Calendar, MapPin, ArrowRight, PencilLine, CircleDot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Event } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import { CalendarDotIcon, CalendarDotsIcon, MapPinAreaIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface EventStatus {
	label: string;
	color: string;
	icon: boolean;
}

/**
 * Calculate event status based on dates and ticket availability
 */
export function getEventStatus(event: Event): EventStatus {
	const now = new Date();
	const eventDate = event.start_date ? new Date(event.start_date) : null;
	const eventEndDate = event.end_date ? new Date(event.end_date) : null;

	// If event has ended
	if (eventEndDate && eventEndDate < now) {
		return {
			label: "ENDED",
			color: "bg-gradient-to-r from-gray-500 to-gray-400",
			icon: false,
		};
	}

	// If event is currently happening
	if (eventDate && eventEndDate && eventDate <= now && eventEndDate >= now) {
		return {
			label: "LIVE NOW",
			color: "bg-gradient-to-r from-red-600 to-pink-500",
			icon: true,
		};
	}

	// Check if any tickets exist
	const hasTickets = event.tiers && Array.isArray(event.tiers) && event.tiers.length > 0;

	if (hasTickets) {
		// Check if all tickets are sold out
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const allSoldOut = event.tiers.every((ticket: any) => (ticket.sold || 0) >= ticket.quantity);

		if (allSoldOut) {
			return {
				label: "SOLD OUT",
				color: "bg-gradient-to-r from-red-500 to-red-400",
				icon: false,
			};
		}

		// Check if sales have started
		const firstTicket = event.tiers[0];
		const salesStart = firstTicket.sales_start ? new Date(firstTicket.sales_start) : null;
		const salesEnd = firstTicket.sales_end ? new Date(firstTicket.sales_end) : null;

		// If sales haven't started yet
		if (salesStart && salesStart > now) {
			return {
				label: "UPCOMING",
				color: "bg-gradient-to-r from-blue-500 to-blue-400",
				icon: false,
			};
		}

		// If sales have ended
		if (salesEnd && salesEnd < now) {
			return {
				label: "SALES ENDED",
				color: "bg-gradient-to-r from-orange-500 to-orange-400",
				icon: false,
			};
		}

		// Sales are active
		return {
			label: "ON SALE",
			color: "bg-gradient-to-r from-green-500 to-emerald-400",
			icon: true,
		};
	}

	// If event is in the future but no tickets
	if (eventDate && eventDate > now) {
		return {
			label: "UPCOMING",
			color: "bg-gradient-to-r from-blue-500 to-blue-400",
			icon: false,
		};
	}

	// Default
	return {
		label: "SCHEDULED",
		color: "bg-gradient-to-r from-gray-500 to-gray-400",
		icon: false,
	};
}

interface EventCardProps {
	event: Event;
}

export default function EventCard({ event }: EventCardProps) {
	const eventDate = event.start_date ? new Date(event.start_date) : null;
	const formattedDate = eventDate ? format(eventDate, "MMM dd, yyyy") : "TBA";
	const formattedTime = eventDate ? format(eventDate, "hh:mm a") : "";
	const status = getEventStatus(event);

	// Parse categories
	const categories: string[] = (Array.isArray(event.category)
		? (event.category as string[])
		: typeof event.category === "string"
			? (event.category as string).split(",")
			: []
	)
		.map((tag: string) => tag.trim().replace(/^[{"]+|[}"]+$/g, ""))
		.filter(Boolean);

	return (
		<div className="rounded-xl bg-white/60 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden flex flex-col h-full">
			{/* Image */}
			<div className="relative aspect-[16/10]">
				<Image
					src={event.banner_image || "/placeholder.png"}
					alt={event.title}
					fill={true}
					className="w-full h-full object-cover"
				/>
				{/* Event Status Badge */}
				{event.status && (
					<Badge
						className={`absolute top-2 left-2 uppercase font-semibold shadow-lg ${event.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-500' :
							event.status === 'pending' ? 'bg-amber-500 hover:bg-amber-500' :
								event.status === 'cancelled' ? 'bg-red-500 hover:bg-red-500' :
									event.status === 'draft' ? 'bg-gray-500 hover:bg-gray-500' :
										event.status === 'live' ? 'bg-green-500 hover:bg-green-500' :
											event.status === 'ended' ? 'bg-gray-500 hover:bg-gray-500' :
												event.status === 'rejected' ? 'bg-red-500 hover:bg-red-500' :
													'bg-gray-500 hover:bg-gray-500'
							}`}
					>
						{event.status}
					</Badge>
				)}
			</div>

			{/* Content */}
			<div className="p-4 space-y-1 flex flex-col flex-1">
				{/* Tags */}
				{categories.length > 0 && (
					<div className="flex text-gray-700 flex-wrap gap-2">
						{categories.map((tag) => (
							<span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded-lg">
								{tag}
							</span>
						))}
					</div>
				)}

				{/* Title */}
				<h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>

				{/* Date & Location */}
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<CalendarDotsIcon className="w-4 h-4" />
					{formatDateTime(event.start_date)}
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<MapPinAreaIcon className="w-4 h-4" />
					{event.address || "Location TBA"}
				</div>

				{/* Actions */}
				<div className="mt-auto">
					<div className="my-4 border-t border-gray-300" />
					<div className="flex justify-between items-center">
						<Link
							href={`/organizerDashboard/pages/eventdetails?id=${event.id}`}
							className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
						>
							View Detail <ArrowRight className="w-4 h-4" />
						</Link>
						<PermissionGuard permission={PERMISSIONS.EVENT_UPDATE}>
							{(event.status === 'pending' || event.status === 'draft') && (
								<Link
									href={`/organizerDashboard/pages/createevents?id=${event.id}&edit=true`}
									className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg"
								>
									<PencilLine className="w-4 h-4" />
								</Link>
							)}
						</PermissionGuard>
					</div>
				</div>
			</div>
		</div>
	);
}
