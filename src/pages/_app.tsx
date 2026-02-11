import type { AppProps } from "next/app";
import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";
import "@/components/editor/themes/editor-theme.css";
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

import { useEffect } from "react";
import { useRouter } from "next/router";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

// Configure nprogress
nprogress.configure({ showSpinner: false });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      nprogress.start();
    };

    const handleStop = () => {
      nprogress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <div className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen`}>
      <QueryProvider>
        <AuthProvider>
          <Component {...pageProps} />
          <Toaster closeButton offset={{ top: "88px", right: "16px" }} />
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}
