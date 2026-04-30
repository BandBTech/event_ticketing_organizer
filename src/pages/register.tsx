import AuthLayout from "@/components/layout/AuthLayout";
import MultiStepRegister from "@/components/auth/MultiStepRegister";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t("auth.signup.title", "Register")}</title>
      </Head>
      <AuthLayout>
        <MultiStepRegister />
      </AuthLayout>
    </>
  );
}
