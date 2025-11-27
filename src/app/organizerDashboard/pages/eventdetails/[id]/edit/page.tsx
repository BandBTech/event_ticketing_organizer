"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CreateEventPage from "@/app/organizerDashboard/components/createEventsForm";
import { eventService } from "@/services/eventService";
import { Event } from "@/types/event";
import { toast } from "@/lib/toast";

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventId = params.id as string;
                if (!eventId) return;

                const eventData = await eventService.getEvent(eventId);
                setEvent(eventData);
            } catch (error) {
                console.error("Error fetching event:", error);
                toast.error("Error", "Failed to load event details");
                router.push("/organizerDashboard/pages/events");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [params.id, router]);

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!event) {
        return <div className="p-6">Event not found</div>;
    }

    return <CreateEventPage initialData={event} isEditing={true} />;
}
