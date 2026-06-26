import { cn } from "@/lib/utils";

type WhatsappGuideStepProps = {
  index: number;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Numbered step card used by the WhatsApp setup guide. Mirrors the rhythm of
 * the inline numbered list on /onboarding/step-3 so the visual language stays
 * familiar between onboarding and settings.
 */
export function WhatsappGuideStep({
  index,
  title,
  children,
  className,
}: WhatsappGuideStepProps) {
  return (
    <section className={cn("card-warm flex gap-4 p-5 sm:p-6", className)}>
      <span
        aria-hidden
        className="bg-brand-orange-soft text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      >
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <h2 className="text-foreground text-lg leading-tight font-bold tracking-tight">
          {title}
        </h2>
        <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
