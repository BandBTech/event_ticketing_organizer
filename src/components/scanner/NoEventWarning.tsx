import Link from "next/link";
import { WarningOctagonIcon } from "@phosphor-icons/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface NoEventWarningProps {
  selectEventText: string;
  backToDashboardText: string;
}

export function NoEventWarning({
  selectEventText,
  backToDashboardText,
}: NoEventWarningProps) {
  return (
    <div className="flex items-center justify-center h-full bg-white text-black p-6 text-center">
      <div className="max-w-md space-y-4">
        <Alert className="bg-amber-50 border-amber-500/50 text-amber-600 p-6">
          <AlertDescription className="flex flex-col items-center gap-2 text-lg">
            <span className="p-3 bg-amber-100 rounded-full">
              <WarningOctagonIcon weight="bold" className="size-8" />
            </span>
            {selectEventText}
          </AlertDescription>
        </Alert>
        <Link href="/staffDashboard">
          <Button variant="default">{backToDashboardText}</Button>
        </Link>
      </div>
    </div>
  );
}

export default NoEventWarning;
