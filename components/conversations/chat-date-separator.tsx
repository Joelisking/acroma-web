import { formatChatDay } from "@/lib/format-datetime"

export function ChatDateSeparator({ iso }: { iso: string }) {
  return (
    <div className="my-1 flex justify-center">
      <time
        dateTime={iso}
        className="rounded-full border border-border bg-card px-3 py-1 text-[0.7rem] font-medium text-muted-foreground"
      >
        {formatChatDay(iso)}
      </time>
    </div>
  )
}
