"use client";

import { useAuthStore } from "@/store/authStore";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import Events from "../components/events";

export default function EventsPage() {
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } = useAuthStore();

  if (isOrganizerRejected()) {
    return (
      <div className="p-6">
        <RejectionNotice />
      </div>
    );
  }

  if (isOrganizerPending()) {
    return (
      <div className="p-6">
        <PendingNotice />
      </div>
    );
  }

  if (isOrganizerInactive()) {
    return (
      <div className="p-6">
        <InactiveNotice />
      </div>
    );
  }

  return <Events />;
}
