import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organizer Panel | Event Ticketing",
  description: "Login and manage your events easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {children}
      </body>
    </html>
  );
}
