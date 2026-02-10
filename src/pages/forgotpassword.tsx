import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Head from "next/head";

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password | Timro-Ticket</title>
      </Head>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
