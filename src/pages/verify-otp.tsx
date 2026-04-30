import AuthLayout from "@/components/layout/AuthLayout";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function VerifyOtpPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("auth.verifyOTP.title", "Verify OTP")}</title>
      </Head>
      <AuthLayout>
        <VerifyOtpForm />
      </AuthLayout>
    </>
  );
}
