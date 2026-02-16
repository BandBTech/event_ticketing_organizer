import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SettingsIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/organizerDashboard/settings/profile");
  }, [router]);

  return null;
}
