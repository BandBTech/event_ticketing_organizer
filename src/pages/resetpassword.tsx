import AuthLayout from "@/components/layout/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("auth.resetPassword.title", "Reset Password")}</title>
      </Head>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
