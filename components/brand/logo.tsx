import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showAi?: boolean;
  /**
   * "default" — orange "Acroma" + navy "AI" (light surfaces).
   * "light"   — orange "Acroma" + white "AI" (dark surfaces).
   */
  tone?: "default" | "light";
};

/**
 * Acroma wordmark — orange "Acroma" + accent "AI".
 * Uses the editorial display font for character.
 */
export function Logo({
  className,
  showAi = true,
  tone = "default",
}: LogoProps) {
  return (
    <span
      className={cn(
        "font-display text-2xl font-semibold tracking-tight",
        className,
      )}
    >
      <span className="text-brand-orange">Acroma</span>
      {showAi ? (
        <span
          className={cn(
            "ml-1.5",
            tone === "light" ? "text-white" : "text-brand-navy",
          )}
        >
          AI
        </span>
      ) : null}
    </span>
  );
}
