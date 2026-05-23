"use client";

import { toast } from "sonner";
import {
  Bell,
  Download,
  EllipsisVertical,
  Share,
  SquarePlus,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInstallTutorial } from "@/hooks/use-install-tutorial";

type Step = { icon: React.ReactNode; text: React.ReactNode };

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-xl">
            {step.icon}
          </span>
          <span className="text-foreground pt-1.5 text-sm">{step.text}</span>
        </li>
      ))}
    </ol>
  );
}

const IOS_STEPS: Step[] = [
  { icon: <Share className="size-4" strokeWidth={1.75} />, text: "Tap the Share button in your browser's toolbar." },
  {
    icon: <SquarePlus className="size-4" strokeWidth={1.75} />,
    text: (
      <>
        Choose <span className="font-medium">Add to Home Screen</span>.
      </>
    ),
  },
  {
    icon: <Bell className="size-4" strokeWidth={1.75} />,
    text: "Open Acroma from the new icon, then come back here to turn on notifications.",
  },
];

const MANUAL_STEPS: Step[] = [
  {
    icon: <EllipsisVertical className="size-4" strokeWidth={1.75} />,
    text: "Open your browser menu.",
  },
  {
    icon: <SquarePlus className="size-4" strokeWidth={1.75} />,
    text: (
      <>
        Choose <span className="font-medium">Install</span> or{" "}
        <span className="font-medium">Add to Home screen</span>.
      </>
    ),
  },
  {
    icon: <Bell className="size-4" strokeWidth={1.75} />,
    text: "Reopen Acroma from the new icon, then turn on notifications.",
  },
];

export function InstallTutorial() {
  const tutorial = useInstallTutorial();
  if (!tutorial.open) return null;

  const { step } = tutorial;
  const isGuide = step === "ios-steps" || step === "manual-steps";

  async function onEnable() {
    const res = await tutorial.enable();
    if (res.ok) toast.success("Notifications turned on");
    else if (res.error) toast.error(res.error);
  }

  return (
    <Dialog open onOpenChange={(next) => !next && tutorial.dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "enable"
              ? "Turn on notifications"
              : "Add Acroma to your home screen"}
          </DialogTitle>
          <DialogDescription>
            {step === "enable"
              ? "Get alerted on this device the moment an order comes in or a chat needs you, even when Acroma is closed."
              : "Install Acroma so it opens like an app and can notify you about new orders and escalations."}
          </DialogDescription>
        </DialogHeader>

        {step === "ios-steps" ? <StepList steps={IOS_STEPS} /> : null}
        {step === "manual-steps" ? <StepList steps={MANUAL_STEPS} /> : null}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === "install" ? (
            <Button onClick={() => void tutorial.install()}>
              <Download /> Install Acroma
            </Button>
          ) : null}
          {step === "enable" ? (
            <Button onClick={() => void onEnable()} disabled={tutorial.busy}>
              <Bell /> Turn on notifications
            </Button>
          ) : null}
          <Button variant="ghost" onClick={tutorial.snooze}>
            {isGuide ? "Got it" : "Maybe later"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
