/**
 * The conversation the hero plays out. One entry per bubble, in order.
 * `kind` swaps the bubble for a richer card so the thread shows the real
 * shape of an Acroma order, not just prose.
 */
export type ThreadEntry = {
  id: string
  from: "customer" | "acroma"
  time: string
  text?: string
  kind?: "order" | "payment" | "paid"
  lines?: { label: string; value: string }[]
  total?: string
}

export const THREAD: ThreadEntry[] = [
  {
    id: "t1",
    from: "customer",
    time: "23:41",
    text: "Good evening. Do you still have the blue kente tote?",
  },
  {
    id: "t2",
    from: "acroma",
    time: "23:41",
    text: "Good evening. Yes, we have it. GHS 180 for the medium and GHS 240 for the large. Which one would you like?",
  },
  {
    id: "t3",
    from: "customer",
    time: "23:42",
    text: "Medium please, 2 of them. Delivery to Osu.",
  },
  {
    id: "t4",
    from: "acroma",
    time: "23:42",
    kind: "order",
    text: "Here is your order. Should I send the payment link?",
    lines: [
      { label: "2 x Kente tote, medium", value: "GHS 360" },
      { label: "Delivery to Osu", value: "GHS 20" },
    ],
    total: "GHS 380",
  },
  { id: "t5", from: "customer", time: "23:43", text: "Yes please" },
  {
    id: "t6",
    from: "acroma",
    time: "23:43",
    kind: "payment",
    text: "Pay GHS 380 with mobile money",
  },
  {
    id: "t7",
    from: "acroma",
    time: "23:44",
    kind: "paid",
    text: "Payment received. Your order is confirmed and we will be in touch about delivery.",
  },
]

/** Dashboard ticket state, keyed to how many bubbles have played. */
export const TICKET_STAGES = [
  { minVisible: 0, status: "New conversation", tone: "muted" as const },
  { minVisible: 4, status: "Order created", tone: "blue" as const },
  { minVisible: 6, status: "Awaiting payment", tone: "orange" as const },
  { minVisible: 7, status: "Paid", tone: "green" as const },
]
