import { CheckIcon, CircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface PasswordRequirementsProps {
  password?: string;
}

export function PasswordRequirements({ password = "" }: PasswordRequirementsProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const hasStartedTyping = password.length > 0;
  const hasLength = password.length >= 8;
  const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const requirements = [
    {
      label: t("auth.passwordRequirements.minLength", "Must consist of at least 8 characters"),
      met: hasLength,
    },
    {
      label: t("auth.passwordRequirements.upperLower", "Must contain at least one uppercase and one lowercase letter"),
      met: hasUpperLower,
    },
    {
      label: t("auth.passwordRequirements.specialChar", "Must contain at least one special character"),
      met: hasSpecialChar,
    },
    {
      label: t("auth.passwordRequirements.number", "Must contain at least one numeric digit"),
      met: hasNumber,
    },
  ];

  return (
    <div className="space-y-1 mt-3">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <CheckIcon size={14} weight="bold" className="text-green-600 shrink-0" aria-label="Requirement met" />
          ) : hasStartedTyping ? (
              <XIcon size={14} weight="bold" className="text-red-600 shrink-0" aria-label="Requirement not met" />
          ) : (
                <CircleIcon size={14} weight="fill" className="text-gray-300 shrink-0" aria-label="Not evaluated" />
          )}
          <span
            aria-live="polite"
            className={cn(
              "transition-colors",
              req.met
                ? "text-green-600 font-medium"
                : hasStartedTyping
                  ? "text-red-600"
                  : "text-gray-500"
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
