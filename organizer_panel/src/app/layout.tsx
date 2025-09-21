import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Organizer Panel | Event Ticketing",
  description: "Login and manage your events easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {/* Global Header */}
        <Header />
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        {/* Separator Line */}
        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
