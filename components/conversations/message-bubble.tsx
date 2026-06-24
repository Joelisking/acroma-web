import { Bot } from "lucide-react";
import type { Message } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

// Matches http(s) URLs so we can render them as clickable links. Location pins
// arrive as message content with a Google Maps link on its own line; the
// merchant should be able to tap straight through to the map.
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_TEST = /^https?:\/\/[^\s]+$/;

// Split message content into plain-text and link segments. We render text as
// React text nodes (never dangerouslySetInnerHTML), so the content stays
// escaped and only well-formed URLs become anchors. The split uses a capturing
// group so the URLs survive as their own array entries; URL_TEST (non-global,
// so it has no stateful lastIndex) decides which entries are links.
function renderContent(content: string) {
  const parts = content.split(URL_PATTERN);
  return parts.map((part, index) =>
    URL_TEST.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

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
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
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
        {renderContent(message.content)}
      </div>
      <span className="text-muted-foreground px-1 text-[0.7rem] tabular-nums">
        {new Date(message.createdAt).toLocaleTimeString(undefined, TIME_FORMAT)}
      </span>
    </div>
  );
}
