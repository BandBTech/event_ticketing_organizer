import AuthLayout from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Timro-Ticket</title>
      </Head>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
