import AuthLayout from "@/components/layout/AuthLayout";
import MultiStepRegister from "@/components/auth/MultiStepRegister";
import Head from "next/head";

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register | Timro-Ticket</title>
      </Head>
      <AuthLayout>
        <MultiStepRegister />
      </AuthLayout>
    </>
  );
}
