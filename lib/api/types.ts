/**
 * Shapes mirrored from the Acroma backend (NestJS).
 * Keep in sync with backend DTOs / Prisma `select` returns.
 *
 * Source of truth: /Users/joel/Documents/acroma-backend/src/**
 */

export type DayHours = { open: string; close: string }

export type OpeningHours = {
  monday: DayHours | null
  tuesday: DayHours | null
  wednesday: DayHours | null
  thursday: DayHours | null
  friday: DayHours | null
  saturday: DayHours | null
  sunday: DayHours | null
}

/**
 * Mirrors Prisma's `BusinessType` enum. Character-identical to the backend
 * so socket payloads / REST responses round-trip cleanly. Source of truth:
 * `acroma-backend/prisma/schema.prisma` (enum BusinessType).
 */
export type BusinessType =
  | "ELECTRONICS"
  | "FASHION_CLOTHING"
  | "FOOD_BEVERAGES"
  | "BEAUTY_COSMETICS"
  | "HOME_FURNITURE"
  | "SERVICES"
  | "GENERAL_STORE"
  | "OTHER"

export type OrdersView = "LIST" | "CALENDAR"

/**
 * Mirrors Prisma's `BookingCapacityMode` enum. Character-identical to the
 * backend so REST responses round-trip cleanly.
 */
export type BookingCapacityMode = "SHARED" | "PER_CATEGORY"

export type Business = {
  id: string
  name: string
  email: string
  currency: string
  country: string
  businessType: BusinessType
  logoUrl: string | null
  catalogImageUrls: string[]
  /** Optional single catalog/menu PDF. When set, Acroma sends it instead of
   * the images when customers ask what's available. */
  catalogPdfUrl: string | null
  whatsappPhoneNumberId: string | null
  whatsappWebhookActive: boolean
  aiEnabled: boolean
  acceptsCashOnDelivery: boolean
  /**
   * Whether this merchant offers pickup alongside delivery. When true the
   * AI will ask "delivery or pickup?" before requesting an address, and
   * pickup orders skip the address ask entirely.
   */
  acceptsPickup: boolean
  /**
   * When true, the merchant gets the "order coming in" heads-up push the
   * moment the AI is about to create an order. Defaults to true.
   */
  orderAlertsEnabled: boolean
  openingHours: OpeningHours | null
  dashboardDefaultFilter: DashboardFilter | null
  /** Saved default view for the orders/bookings page (services may default to calendar). */
  ordersDefaultView: OrdersView
  bookingCapacityMode: BookingCapacityMode
  defaultBookingCapacity: number
  defaultServiceDurationMinutes: number
  categoryBookingCapacities: Record<string, number> | null
  businessDescription: string | null
  aiBusinessContext: string | null
  /** Phone number the AI can give customers who want to call. */
  contactPhone: string | null
  expoPushToken: string | null
  emailNotificationsEnabled: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Who is signed in. An owner is the business itself; a staff member is a
 * worker login that hangs off that business.
 */
export type AuthRole = "OWNER" | "STAFF"

/**
 * The token bundle returned by the owner-only endpoints — `/auth/register`
 * and `/auth/change-password`. They can only ever be reached by an owner, so
 * the backend does not stamp a `role` on them and `business` is always there.
 */
export type AuthResponse = {
  accessToken: string
  refreshToken: string
  business: Business
}

export type OwnerLoginResponse = AuthResponse & {
  role: "OWNER"
}

/**
 * Note there is no `business` here. A staff login never receives the business
 * row, so this is modelled as a separate member of the union rather than by
 * making `business` optional — that way the compiler forces every caller to
 * narrow on `role` before it can touch `business`.
 */
export type StaffLoginResponse = {
  accessToken: string
  refreshToken: string
  role: "STAFF"
  mustChangePassword: boolean
  staff: { id: string; name: string }
}

export type LoginResponse = OwnerLoginResponse | StaffLoginResponse

/** A worker login belonging to a business. Owner-facing shape — no hashes. */
export type Staff = {
  id: string
  name: string
  username: string
  mustChangePassword: boolean
  deactivatedAt: string | null
  createdAt: string
}

/**
 * The reply to creating a worker. `temporaryPassword` is returned by the
 * backend exactly once and can never be read back — surface it to the owner
 * immediately or it is lost. A freshly created worker is always
 * `mustChangePassword: true` and never deactivated, so the backend leaves
 * those two fields off this payload.
 */
export type CreatedStaff = {
  id: string
  name: string
  username: string
  createdAt: string
  temporaryPassword: string
}

/** The reply to a password reset — the new temporary password, once. */
export type StaffTemporaryPassword = {
  temporaryPassword: string
}

export type RefreshResponse = {
  accessToken: string
}

export type ApiErrorBody = {
  statusCode: number
  message: string | string[]
  error?: string
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export type ConversationStatus =
  | "AI_HANDLING"
  | "WAITING_FOR_OWNER"
  | "WITH_OWNER"
  | "RESOLVED"

export type MessageSender = "CUSTOMER" | "AI" | "OWNER"

// Mirrors the backend `MessageMediaType` enum (prisma/schema.prisma).
export type MessageMediaType = "IMAGE" | "DOCUMENT"

export type Message = {
  id: string
  conversationId: string
  sender: MessageSender
  content: string
  whatsappMsgId: string | null
  // Renderable media. `mediaUrl` (a public CDN URL) is set for media WE send
  // (menu, product images) and renders directly. Customer-sent media has only
  // a WhatsApp id on the backend; the dashboard fetches those through the
  // same-origin media proxy route by message id.
  mediaType: MessageMediaType | null
  mediaUrl: string | null
  mediaFilename: string | null
  createdAt: string
}

export type Conversation = {
  id: string
  businessId: string
  customerPhone: string
  customerName: string | null
  status: ConversationStatus
  lastMessageAt: string
  unread: boolean
  /**
   * Set when AI escalated and the merchant hasn't replied yet (real OWNER
   * message). Survives auto-takeover — the conversation flips back to
   * AI-handling but this flag stays set until the merchant either replies or
   * marks the conversation resolved.
   */
  pendingOwnerSince: string | null
  /** First time the merchant ever acknowledged this conversation. Historical. */
  ownerAcknowledgedAt: string | null
  /** Free-text reason captured at escalation, used by the dashboard banner. */
  escalationReason: string | null
  /** Number of reminders fired so far in the current pending cycle. */
  reminderCount: number
  createdAt: string
  updatedAt: string
}

export type ConversationWithMessages = Conversation & {
  messages: Message[]
}

export type HandoffAction = "TAKE_OVER" | "RESUME_AI"

/**
 * Per-merchant escalation reminder cadence. Backend bounds:
 *   - minute fields: 1–1440
 *   - maxReminders: 1–10
 *   - appointmentReminderHours: 1–168
 */
export type ReminderSettings = {
  reminderFirstMinutes: number
  reminderSecondMinutes: number
  reminderThirdMinutes: number
  autoTakeoverMinutes: number
  maxReminders: number
  /** SERVICES only. Hours before a scheduled appointment to send a reminder. */
  appointmentReminderHours: number
  /**
   * SERVICES only. Approved WhatsApp template name used to reach customers
   * who last messaged more than 24 hours ago. Null means only customers
   * inside the 24-hour window will receive the reminder.
   */
  appointmentReminderTemplateName: string | null
}

/** Mirrors the backend `BookingCapacityDto`. */
export type BookingCapacitySettings = {
  bookingCapacityMode: BookingCapacityMode
  defaultBookingCapacity: number
  defaultServiceDurationMinutes: number
  categoryBookingCapacities: Record<string, number> | null
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

export type DiscountType = "PERCENTAGE" | "FIXED"

export type Discount = {
  id: string
  businessId: string
  code: string
  type: DiscountType
  value: number
  validFrom: string | null
  validUntil: string | null
  totalUsageLimit: number | null
  perCustomerLimit: number
  usageCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OrderDiscount = {
  id: string
  code: string
  type: DiscountType
  value: number
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type PaymentMethod = "MOMO" | "CASH_ON_DELIVERY"

export type OrderFulfillment = "DELIVERY" | "PICKUP"

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "NO_SHOW"
  | "PAYMENT_FAILED"

export type OrderItem = {
  id: string
  orderId: string
  productId: string | null
  variantId: string | null
  quantity: number
  unitPrice: number
  productName: string | null
  product: { id: string; name: string } | null
  /** The variant the customer chose (e.g. { Size: "Large" }), when the item has
   *  variants. Null for plain items. */
  variant: { attributes: Record<string, string> } | null
}

// ---------------------------------------------------------------------------
// Products + Variants
// ---------------------------------------------------------------------------

export type ProductVariant = {
  id: string
  productId: string
  attributes: Record<string, string>
  sku: string | null
  priceOverride: number | null
  stock: number
  imageUrl: string | null
  isActive: boolean
}

export type VariantDimension = {
  name: string
  options: string[]
  optionImages?: Record<string, string>
}

export type ParsedProduct = {
  name: string
  description: string | null
  category: string | null
  basePrice: number
  hasVariants: boolean
  variantDimensions: VariantDimension[]
  variants: Array<{
    attributes: Record<string, string>
    stock: number
    priceOverride: number | null
  }>
  stock: number | null
  estimatedDurationMinutes?: number | null
}

/**
 * Mirrors Prisma's `ProductTag` enum. Optional dietary / allergen flags a
 * merchant marks on a product. Surfaced inline in the AI catalog string so
 * the model can answer "is this halal/vegetarian/etc?" without escalating.
 * Empty array == merchant has not made any claims either way.
 */
export type ProductTag =
  | "HALAL"
  | "VEGETARIAN"
  | "VEGAN"
  | "GLUTEN_FREE"
  | "DAIRY_FREE"
  | "CONTAINS_NUTS"
  | "SPICY"

export type Product = {
  id: string
  businessId: string
  name: string
  description: string | null
  basePrice: number
  stock: number
  estimatedDurationMinutes: number | null
  imageUrl: string | null
  isActive: boolean
  category: string | null
  hasVariants: boolean
  variantDimensions: VariantDimension[] | null
  /**
   * Manually set by the merchant when an item runs out for the day.
   * Distinct from the permanent `stock = 0` state. Auto-resets at the
   * start of the next UTC day (Ghana is UTC+0, so this is local midnight)
   * via lazy check on the backend — no cron involved.
   */
  soldOutAt: string | null
  /**
   * Dietary / allergen tags marked by the merchant. Always an array
   * (possibly empty) from the API. Drives the AI's grounded answers to
   * "is this halal?", "is it vegetarian?", etc.
   */
  tags: ProductTag[]
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
}

// ---------------------------------------------------------------------------
// Form state shapes (UI-side, not from the API)
// ---------------------------------------------------------------------------

export type ProductVariantFormRow = {
  attributes: Record<string, string>
  stock: number
  priceOverride: number | null
  isActive: boolean
}

/**
 * Editable shape backing the new-product page. Numeric fields are kept
 * as strings so that controlled inputs never fight the user mid-typing
 * (mirrors the mobile app's `ProductFormValues`). Conversion to numbers
 * happens at submit time.
 */
export type ProductFormValues = {
  name: string
  description: string
  basePrice: string
  stock: string
  /** Services: estimated duration in minutes, as a string (converted at submit). */
  estimatedDurationMinutes: string
  category: string
  imageUrl: string
  isActive: boolean
  hasVariants: boolean
  variantDimensions: VariantDimension[]
  variants: ProductVariantFormRow[]
  /**
   * Dietary / allergen tags the merchant has marked on this product.
   * Optional; defaults to an empty array. See `ProductTag` for the
   * canonical list.
   */
  tags: ProductTag[]
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/**
 * Mirrors Prisma's `OrderSource` enum. Character-identical to the backend.
 * Source of truth: `acroma-backend/prisma/schema.prisma`.
 * WHATSAPP — taken by the AI or authored from a conversation.
 * TILL — a walk-in rung up at the counter.
 */
export type OrderSource = "WHATSAPP" | "TILL"

export type Order = {
  id: string
  businessId: string
  customerPhone: string
  customerName: string | null
  status: OrderStatus
  totalAmount: number
  currency: string
  paystackRef: string | null
  paystackAuthUrl: string | null
  paystackPreviousRefs: string[]
  notes: string | null
  deliveryAddress: string | null
  fulfillment: OrderFulfillment
  paymentMethod: PaymentMethod
  source: OrderSource
  subtotal: number
  discountId: string | null
  discountAmount: number
  scheduledFor: string | null
  amountPaid: number | null
  // Refund owed after a correction dropped the total below what was collected.
  // > 0 means outstanding; the merchant refunds manually (no auto-refund).
  refundDueAmount: number
  refundMomoNumber: string | null
  refundMomoName: string | null
  refundedAt: string | null
  /** Set when the merchant has removed the order from the dashboard. Hidden
   *  from the default list; recoverable via the Archived filter. */
  archivedAt: string | null
  discount: OrderDiscount | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  /** Present only on GET /orders/:id (the list endpoint doesn't include it). */
  pendingTopUp?: OrderTopUp | null
}

export type OrderLineInput =
  | { productId: string; variantId?: string; quantity: number }
  | { customName: string; unitPrice: number; quantity: number }

export type CreateOrderInput = {
  /** Omitted means WHATSAPP. TILL relaxes the phone requirement below. */
  source?: OrderSource
  /** Required for a WhatsApp order; optional at the till, where a walk-in may
   *  give no number and the backend substitutes its walk-in marker. */
  customerPhone?: string
  customerName?: string
  preferredName?: string
  fulfillment: OrderFulfillment
  deliveryAddress?: string
  paymentMethod: PaymentMethod
  items: OrderLineInput[]
  discountCode?: string
}

export type EditOrderInput = {
  items: OrderLineInput[]
  fulfillment?: OrderFulfillment
  deliveryAddress?: string
}

/**
 * Mirrors Prisma's `OrderTopUpStatus` enum. Character-identical to the
 * backend. Source of truth: `acroma-backend/prisma/schema.prisma`.
 */
export type OrderTopUpStatus = "PENDING" | "PAID" | "CANCELLED"

/**
 * Mirrors Prisma's `OrderTopUpKind` enum. Character-identical to the backend.
 * ADD_ON — customer-initiated add; items applied on payment.
 * CORRECTION — merchant correction; items already applied, ledger tracks balance.
 */
export type OrderTopUpKind = "ADD_ON" | "CORRECTION"

/**
 * A single resolved line captured on an `OrderTopUp`. Mirrors the backend's
 * `OrderWriterService.ResolvedLine` shape (already-resolved, priced items —
 * not the raw `OrderLineInput[]` the merchant/AI originally sent).
 */
export type OrderTopUpLine = {
  productId: string | null
  variantId: string | null
  productName: string
  unitPrice: number
  quantity: number
}

/**
 * A supplemental payment request captured when a customer asks to change
 * items on an order that's already paid. See
 * `acroma-backend/docs/superpowers/specs/2026-07-02-paid-order-topup-design.md`.
 */
export type OrderTopUp = {
  id: string
  orderId: string
  status: OrderTopUpStatus
  kind: OrderTopUpKind
  requestedItems: OrderTopUpLine[]
  newSubtotal: number
  newTotal: number
  previousTotal: number | null
  deltaAmount: number
  note: string | null
  paystackRef: string | null
  paystackAuthUrl: string | null
  escalationReason: string
  createdAt: string
  updatedAt: string
}

export type CorrectOrderInput = {
  items: OrderLineInput[]
  note?: string
}

// ---------------------------------------------------------------------------
// Payments — payout account (Paystack subaccount)
// ---------------------------------------------------------------------------

export type PayoutAccountType = "BANK" | "MOBILE_MONEY"

export type PayoutAccount = {
  paystackSubaccountCode: string | null
  payoutAccountType: PayoutAccountType | null
  payoutBankCode: string | null
  payoutBankName: string | null
  payoutAccountNumber: string | null
  payoutAccountName: string | null
  payoutConfiguredAt: string | null
}

export type BankSummary = { code: string; name: string }
export type ResolvedAccount = { accountName: string; accountNumber: string }

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type Customer = {
  id: string
  businessId: string
  phone: string
  name: string | null
  optedOut: boolean
  optedOutAt: string | null
  lastMessageAt: string | null
  lastOrderAt: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export type BroadcastAudienceBucket =
  | "ALL_CUSTOMERS"
  | "ACTIVE_LAST_30_DAYS"
  | "ACTIVE_LAST_90_DAYS"
  | "IN_24H_WINDOW"

export type BroadcastStatus = "DRAFT" | "QUEUED" | "SENDING" | "SENT" | "FAILED"

export type BroadcastRecipientStatus =
  | "PENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "SKIPPED"

export type WhatsappTemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "DISABLED"

export type WhatsappTemplate = {
  id: string
  businessId: string
  name: string
  language: string
  category: string
  status: WhatsappTemplateStatus
  body: string
  variableCount: number
  lastSyncedAt: string
}

export type Broadcast = {
  id: string
  businessId: string
  name: string
  audienceBucket: BroadcastAudienceBucket
  bodyTemplate: string
  templateId: string | null
  templateLanguage: string | null
  discountId: string | null
  status: BroadcastStatus
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  template: Pick<WhatsappTemplate, "id" | "name" | "language" | "status"> | null
  discount: Pick<Discount, "id" | "code" | "type" | "value"> | null
}

export type BroadcastRecipient = {
  id: string
  broadcastId: string
  customerId: string
  status: BroadcastRecipientStatus
  whatsappMsgId: string | null
  errorCode: string | null
  errorMessage: string | null
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Dashboard filtering
// ---------------------------------------------------------------------------

export type DashboardRange =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_6_HOURS"
  | "LAST_12_HOURS"
  | "LAST_24_HOURS"
  | "LAST_48_HOURS"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "THIS_YEAR"
  | "LIFETIME"
  | "CUSTOM"

export type CustomerSegment = "NEW" | "RETURNING"

/** Mirrors the backend DashboardStatsQueryDto. Character-identical enums. */
export type DashboardFilter = {
  range: DashboardRange
  startDate?: string
  endDate?: string
  orderStatus?: OrderStatus
  conversationStatus?: ConversationStatus
  customerSegment?: CustomerSegment
  customerPhone?: string
  compare?: boolean
}

type DashboardMetrics = {
  conversations: number
  orders: number
  revenue: number
  /**
   * The same revenue split by how the money arrived. Paystack is every MoMo
   * order (the only method that goes through a payment link); cash is
   * collected by hand, at the counter or on delivery. The two sum to
   * `revenue`, so this is a breakdown of it rather than extra figures.
   */
  revenueByMethod: { paystack: number; cash: number }
  noShowCount: number
  noShowRate: number
}

export type DashboardStats = {
  range: { start: string; end: string; label: string }
  metrics: DashboardMetrics
  previous?: {
    range: { start: string; end: string }
    metrics: DashboardMetrics
    change: {
      conversations: number | null
      orders: number | null
      revenue: number | null
    }
  }
}

export type ProductRevenueRow = {
  productId: string | null
  name: string
  revenue: number
  unitsSold: number
  orderCount: number
  pctOfTotal: number
}

export type ProductRevenueSeriesPoint = {
  bucket: string
  [seriesKey: string]: number | string
}

/** Mirrors the backend ProductRevenueReport. */
export type ProductRevenueReport = {
  range: { start: string; end: string; label: string }
  currency: string
  totalRevenue: number
  /**
   * `totalRevenue` split by how the money arrived. Paystack is every MoMo
   * order; cash is collected by hand, at the counter or on delivery. The two
   * always sum to the total, so this is a breakdown rather than extra figures.
   *
   * Optional because the web app and the API deploy independently: if the
   * frontend ships first, this field is simply absent, and a whole analytics
   * page must not go blank over one missing breakdown.
   */
  revenueByMethod?: { paystack: number; cash: number }
  bucket: "hour" | "day"
  products: ProductRevenueRow[]
  seriesKeys: string[]
  series: ProductRevenueSeriesPoint[]
}

export type AnalyticsFilter = {
  range: DashboardRange
  startDate?: string
  endDate?: string
}

export type DashboardActivityConversation = {
  id: string
  customerName: string | null
  customerPhone: string
  status: ConversationStatus
  lastMessageAt: string
}

export type DashboardActivityOrder = {
  id: string
  customerName: string | null
  customerPhone: string
  status: OrderStatus
  totalAmount: number
  currency: string
  createdAt: string
}

export type DashboardActivity = {
  conversations: DashboardActivityConversation[]
  orders: DashboardActivityOrder[]
}

/** Who triggered an audited event. */
export type AuditActor = "CUSTOMER" | "AI" | "OWNER" | "STAFF" | "SYSTEM"

/**
 * A single row from the backend audit log (`GET /audit`). Read-only;
 * surfaced in the conversation Activity timeline as a debugging aid.
 * `eventType` is an open string (e.g. `ai.action`, `order.status`) so new
 * backend events render gracefully without a frontend change.
 */
export type AuditEntry = {
  id: string
  businessId: string
  conversationId: string | null
  orderId: string | null
  actor: AuditActor
  /**
   * The acting worker's name for a staff action. Null for owner, AI, customer
   * and system actions, and for a worker whose record has since been removed.
   */
  actorName: string | null
  eventType: string
  summary: string
  detail: unknown | null
  createdAt: string
}
