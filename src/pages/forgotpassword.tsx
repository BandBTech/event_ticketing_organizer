import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("auth.forgotPassword.title", "Forgot Password")}</title>
      </Head>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
