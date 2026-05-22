import { Bot, Clock, User, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ConversationStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Meta = {
  label: string;
  Icon: LucideIcon;
  className: string;
};

const META: Record<ConversationStatus, Meta> = {
  AI_HANDLING: {
    label: "AI",
    Icon: Bot,
    className: "bg-brand-blue-soft text-brand-blue",
  },
  WAITING_FOR_OWNER: {
    label: "Waiting",
    Icon: Clock,
    className: "bg-brand-orange-soft text-brand-orange",
  },
  WITH_OWNER: {
    label: "You",
    Icon: User,
    className: "bg-secondary text-secondary-foreground",
  },
  RESOLVED: {
    label: "Resolved",
    Icon: CheckCircle2,
    className: "bg-brand-green-soft text-brand-green",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ConversationStatus;
  className?: string;
}) {
  const meta = META[status];
  const { Icon } = meta;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3" strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}
