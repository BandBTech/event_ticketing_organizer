import AuthLayout from "@/components/layout/AuthLayout";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import Head from "next/head";

export default function VerifyOtpPage() {
  return (
    <>
      <Head>
        <title>Verify OTP | Timro-Ticket</title>
      </Head>
      <AuthLayout>
        <VerifyOtpForm />
      </AuthLayout>
    </>
  );
}
