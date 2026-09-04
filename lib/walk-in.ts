/**
 * The reserved marker the backend stores in `Order.customerPhone` when a till
 * walk-in gave no number. Mirrors `WALK_IN_PHONE` in
 * `acroma-backend/src/orders/order.helpers.ts`.
 *
 * Lives in `lib/` rather than beside a component so `formatPhone` can guard on
 * it without a UI module importing another UI module.
 */
export const WALK_IN_PHONE = "WALK_IN"

export function isWalkIn(phone: string | null | undefined): boolean {
  return phone === WALK_IN_PHONE
}
