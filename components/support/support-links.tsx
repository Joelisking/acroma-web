export const WHATSAPP_SUPPORT = [
  { number: "+233553134944", url: "https://wa.me/233553134944" },
  { number: "+233594765977", url: "https://wa.me/233594765977" },
] as const

export function SupportLinks({ message }: { message?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>WhatsApp only:</span>
      {WHATSAPP_SUPPORT.map(({ number, url }) => (
        <a
          key={number}
          href={message ? `${url}?text=${encodeURIComponent(message)}` : url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {number}
        </a>
      ))}
    </span>
  )
}
