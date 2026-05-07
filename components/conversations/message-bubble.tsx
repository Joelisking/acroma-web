import { Bot } from "lucide-react";
import type { Message } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

export function MessageBubble({ message }: { message: Message }) {
  const isCustomer = message.sender === "CUSTOMER";
  const isAi = message.sender === "AI";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1",
        isCustomer ? "items-start" : "items-end",
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isCustomer && "bg-muted text-foreground rounded-bl-sm",
          isAi &&
            "bg-brand-blue-soft text-brand-navy rounded-br-sm border border-brand-blue/15",
          message.sender === "OWNER" &&
            "bg-brand-orange text-primary-foreground rounded-br-sm",
        )}
      >
        {isAi ? (
          <span className="text-brand-blue mb-1 flex items-center gap-1 text-[0.7rem] font-medium">
            <Bot className="size-3" strokeWidth={2.25} /> Acroma AI
          </span>
        ) : null}
        {message.content}
      </div>
      <span className="text-muted-foreground px-1 text-[0.7rem] tabular-nums">
        {new Date(message.createdAt).toLocaleTimeString(undefined, TIME_FORMAT)}
      </span>
    </div>
  );
}
