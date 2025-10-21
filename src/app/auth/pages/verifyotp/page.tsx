import VerifyOtpContent from "@/app/auth/components/verifyOtpForm";
import { Suspense } from "react";

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
