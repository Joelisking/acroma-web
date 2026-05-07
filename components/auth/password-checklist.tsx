import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

/**
 * Live checklist of password strength rules. Re-renders as the user types.
 * Shared by register, reset-password, and change-password forms.
 */
export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              ok ? "text-brand-green" : "text-muted-foreground",
            )}
          >
            {ok ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
