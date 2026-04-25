"use client";
import { Ticket } from "lucide-react";
import { LanguageSelector } from "@/components/organizerDashboard/LanguageSelector";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3">
      {/* Logo / Brand Name */}
      <div className=" flex gap-1 items-center text-xl font-bold text-blue-600 select-none">
        {/*<Ticket className="w-6 h-6" />
        Timro-Ticket*/}
        <img src="/timro-ticket-logo.png" alt="Timro-Ticket" className="h-11" />
      </div>

      {/* Language Selector */}
      <LanguageSelector />
    </header>
  );
}
