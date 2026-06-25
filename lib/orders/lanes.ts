import type { Order, OrderStatus } from "@/lib/api/types";

/**
 * Operational lanes for the orders board. These group the eleven raw
 * OrderStatus values into the four buckets a merchant actually thinks in
 * during service: what needs a move now, what's being worked, what's ready to
 * hand off, and what's closed out. The board renders lanes top-to-bottom in
 * this order so the work that needs attention sits highest.
 *
 * Non-services only — services run on the calendar/list view, which keys off
 * scheduled times rather than fulfilment state.
 */
export type OrderLaneId = "action" | "active" | "ready" | "completed" | "closed";

export type LaneTone = "attention" | "active" | "ready" | "muted";

export type OrderLane = {
  id: OrderLaneId;
  label: string;
  statuses: OrderStatus[];
  tone: LaneTone;
  /** Terminal lanes are folded away in the focused "Live" view. */
  terminal: boolean;
};

const LANES: OrderLane[] = [
  {
    id: "action",
    label: "Needs your move",
    statuses: ["PENDING", "PAYMENT_PENDING", "PAID", "PAYMENT_FAILED"],
    tone: "attention",
    terminal: false,
  },
  {
    id: "active",
    label: "In progress",
    statuses: ["PROCESSING", "PREPARING"],
    tone: "active",
    terminal: false,
  },
  {
    id: "ready",
    label: "Ready to hand off",
    statuses: ["READY_FOR_PICKUP", "SHIPPED"],
    tone: "ready",
    terminal: false,
  },
  {
    id: "completed",
    label: "Completed",
    statuses: ["DELIVERED"],
    tone: "muted",
    terminal: true,
  },
  {
    id: "closed",
    label: "Closed",
    statuses: ["CANCELLED", "NO_SHOW"],
    tone: "muted",
    terminal: true,
  },
];

export type LaneGroup = { lane: OrderLane; orders: Order[] };

/**
 * Bucket orders into lanes, preserving the incoming order within each lane
 * (the API returns newest first). Returns every lane, including empty ones, so
 * the board can decide what to show; callers filter empties.
 */
export function groupOrdersIntoLanes(orders: Order[]): LaneGroup[] {
  const laneFor = new Map<OrderStatus, OrderLaneId>();
  for (const lane of LANES) {
    for (const status of lane.statuses) laneFor.set(status, lane.id);
  }

  const buckets = new Map<OrderLaneId, Order[]>();
  for (const lane of LANES) buckets.set(lane.id, []);
  for (const order of orders) {
    const id = laneFor.get(order.status);
    if (id) buckets.get(id)!.push(order);
  }

  return LANES.map((lane) => ({ lane, orders: buckets.get(lane.id)! }));
}
