import { Logo } from "@/components/brand/logo";
import { OnboardingProgress } from "./progress";

type WizardShellProps = {
  step: number;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
};

const TOTAL_STEPS = 4;

export function WizardShell({
  step,
  eyebrow,
  title,
  subtitle,
  children,
}: WizardShellProps) {
  return (
    <div className="bg-background relative min-h-svh">
      <header className="border-border/70 bg-background/85 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Logo />
          <span className="text-muted-foreground text-xs">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <div className="mb-8">
          <OnboardingProgress current={step} total={TOTAL_STEPS} />
        </div>

        <div className="mb-8 space-y-3">
          <p className="eyebrow text-brand-orange">{eyebrow}</p>
          <h1 className="font-display text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
