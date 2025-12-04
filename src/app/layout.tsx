// import type { Metadata } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/components/providers/AuthProvider";

// export const metadata: Metadata = {
//   title: "Organizer Panel | Event Ticketing",
//   description: "Login and manage your events easily",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <AuthProvider>
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Timro-Ticket - Event Ticketing Platform",
  description:
    "Discover and book tickets for amazing events in Nepal. From music festivals to conferences, find your next experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster closeButton offset={{ top: "88px", right: "16px" }} />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
