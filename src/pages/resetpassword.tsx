import AuthLayout from "@/components/layout/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Head from "next/head";

export default function ResetPasswordPage() {
  return (
    <>
      <Head>
        <title>Reset Password | Timro-Ticket</title>
      </Head>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
