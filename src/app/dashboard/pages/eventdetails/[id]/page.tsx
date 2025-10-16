"use client"
import { useParams } from "next/navigation";
import EventDetails from "@/app/dashboard/components/eventDetails";
import { events } from "@/app/data/events";


export default function EventDetailsPage(){
const params = useParams();
const event = events.find(e => e.id === params.id );

if(!event){
    return <div className="p-6 text-red-600">Event not found!</div>
}
    return <EventDetails event={event}/>;
}