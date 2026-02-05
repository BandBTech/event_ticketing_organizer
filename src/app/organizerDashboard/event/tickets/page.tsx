import { Suspense } from "react";
import EventTicketsClient from "./EventTicketsClient";
import { Loader2 } from "lucide-react";

export default function EventTicketsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <EventTicketsClient />
    </Suspense>
  );
}
