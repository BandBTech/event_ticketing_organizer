"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if(token) router.push("/organizerDashboard");
  }, [router]);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Header */}
      <Header />
      {/* Main Auth Content */}
      <main className="flex-1 flex items-center justify-center">{children}</main>
      {/* Auth Footer */}
      <Footer />
    </div>
  );
}
