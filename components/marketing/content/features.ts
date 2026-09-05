import {
  BarChart3,
  BookOpen,
  Clock,
  LayoutDashboard,
  Megaphone,
  Mic,
  PackageSearch,
  Store,
  Users,
  Wallet,
} from "lucide-react"

export type Feature = {
  title: string
  body: string
  icon: typeof Clock
  /** Wide tiles anchor the bento; the rest fill in around them. */
  wide?: boolean
  tone: "orange" | "blue" | "green"
}

/**
 * Order matters. A wide tile takes two columns, so the sequence below is
 * arranged to fill a three-column grid with no gaps: wide + one, then three,
 * then wide + one, then three.
 */
export const FEATURES: Feature[] = [
  {
    title: "Answers in seconds, at any hour",
    body: "Midnight, Sunday, the middle of a rush. Every customer gets a reply straight away, in the same chat they started.",
    icon: Clock,
    wide: true,
    tone: "orange",
  },
  {
    title: "Knows your catalog",
    body: "Prices, sizes, options and what is sold out today. It answers from your real catalog, not a guess.",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Collects mobile money",
    body: "Payment links go out through Paystack and land in your own account. Confirmation is automatic.",
    icon: Wallet,
    tone: "green",
  },
  {
    title: "Understands voice notes",
    body: "Customers who would rather talk than type get the same service. Acroma listens and replies.",
    icon: Mic,
    tone: "orange",
  },
  {
    title: "Tracks what you have left",
    body: "Stock comes down as orders come in, and sold out items stop being offered.",
    icon: PackageSearch,
    tone: "blue",
  },
  {
    title: "One live dashboard",
    body: "Every conversation and every order in one place, updating as it happens. Nothing to refresh, nothing to chase.",
    icon: LayoutDashboard,
    wide: true,
    tone: "blue",
  },
  {
    title: "Serves the counter too",
    body: "Ring up walk-in and cash orders on the till screen. They join the same board as your chat orders.",
    icon: Store,
    tone: "orange",
  },
  {
    title: "Messages your customers back",
    body: "Send a broadcast when something new lands or a favourite returns, straight to people who already bought.",
    icon: Megaphone,
    tone: "green",
  },
  {
    title: "Shows you the numbers",
    body: "Revenue by product, by hour and by payment method, so you can see what is actually selling.",
    icon: BarChart3,
    tone: "blue",
  },
  {
    title: "Remembers every customer",
    body: "What they bought, how often, and what they favour, built up quietly as they order.",
    icon: Users,
    tone: "green",
  },
]
