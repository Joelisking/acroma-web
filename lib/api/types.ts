/**
 * Shapes mirrored from the Acroma backend (NestJS).
 * Keep in sync with backend DTOs / Prisma `select` returns.
 *
 * Source of truth: /Users/joel/Documents/acroma-backend/src/**
 */

export type DayHours = { open: string; close: string };

export type OpeningHours = {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
};

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
  | "OTHER";

export type Business = {
  id: string;
  name: string;
  email: string;
  currency: string;
  country: string;
  businessType: BusinessType;
  logoUrl: string | null;
  catalogImageUrls: string[];
  whatsappPhoneNumberId: string | null;
  whatsappWebhookActive: boolean;
  aiEnabled: boolean;
  acceptsCashOnDelivery: boolean;
  /**
   * Whether this merchant offers pickup alongside delivery. When true the
   * AI will ask "delivery or pickup?" before requesting an address, and
   * pickup orders skip the address ask entirely.
   */
  acceptsPickup: boolean;
  /**
   * When true, the merchant gets the "order coming in" heads-up push the
   * moment the AI is about to create an order. Defaults to true.
   */
  orderAlertsEnabled: boolean;
  openingHours: OpeningHours | null;
  dashboardDefaultFilter: DashboardFilter | null;
  businessDescription: string | null;
  aiBusinessContext: string | null;
  expoPushToken: string | null;
  emailNotificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  business: Business;
};

export type RefreshResponse = {
  accessToken: string;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export type ConversationStatus =
  | "AI_HANDLING"
  | "WAITING_FOR_OWNER"
  | "WITH_OWNER"
  | "RESOLVED";

export type MessageSender = "CUSTOMER" | "AI" | "OWNER";

export type Message = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  whatsappMsgId: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  businessId: string;
  customerPhone: string;
  customerName: string | null;
  status: ConversationStatus;
  lastMessageAt: string;
  unread: boolean;
  /**
   * Set when AI escalated and the merchant hasn't replied yet (real OWNER
   * message). Survives auto-takeover — the conversation flips back to
   * AI-handling but this flag stays set until the merchant either replies or
   * marks the conversation resolved.
   */
  pendingOwnerSince: string | null;
  /** First time the merchant ever acknowledged this conversation. Historical. */
  ownerAcknowledgedAt: string | null;
  /** Free-text reason captured at escalation, used by the dashboard banner. */
  escalationReason: string | null;
  /** Number of reminders fired so far in the current pending cycle. */
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type HandoffAction = "TAKE_OVER" | "RESUME_AI";

/**
 * Per-merchant escalation reminder cadence. Backend bounds:
 *   - minute fields: 1–1440
 *   - maxReminders: 1–10
 */
export type ReminderSettings = {
  reminderFirstMinutes: number;
  reminderSecondMinutes: number;
  reminderThirdMinutes: number;
  autoTakeoverMinutes: number;
  maxReminders: number;
};

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

export type DiscountType = "PERCENTAGE" | "FIXED";

export type Discount = {
  id: string;
  businessId: string;
  code: string;
  type: DiscountType;
  value: number;
  validFrom: string | null;
  validUntil: string | null;
  totalUsageLimit: number | null;
  perCustomerLimit: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderDiscount = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type PaymentMethod = "MOMO" | "CASH_ON_DELIVERY";

export type OrderFulfillment = "DELIVERY" | "PICKUP";

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
  | "PAYMENT_FAILED";

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string };
};

// ---------------------------------------------------------------------------
// Products + Variants
// ---------------------------------------------------------------------------

export type ProductVariant = {
  id: string;
  productId: string;
  attributes: Record<string, string>;
  sku: string | null;
  priceOverride: number | null;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type VariantDimension = {
  name: string;
  options: string[];
  optionImages?: Record<string, string>;
};

export type ParsedProduct = {
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  hasVariants: boolean;
  variantDimensions: VariantDimension[];
  variants: Array<{
    attributes: Record<string, string>;
    stock: number;
    priceOverride: number | null;
  }>;
  stock: number | null;
};

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
  | "SPICY";

export type Product = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  basePrice: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category: string | null;
  hasVariants: boolean;
  variantDimensions: VariantDimension[] | null;
  /**
   * Manually set by the merchant when an item runs out for the day.
   * Distinct from the permanent `stock = 0` state. Auto-resets at the
   * start of the next UTC day (Ghana is UTC+0, so this is local midnight)
   * via lazy check on the backend — no cron involved.
   */
  soldOutAt: string | null;
  /**
   * Dietary / allergen tags marked by the merchant. Always an array
   * (possibly empty) from the API. Drives the AI's grounded answers to
   * "is this halal?", "is it vegetarian?", etc.
   */
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
};

// ---------------------------------------------------------------------------
// Form state shapes (UI-side, not from the API)
// ---------------------------------------------------------------------------

export type ProductVariantFormRow = {
  attributes: Record<string, string>;
  stock: number;
  priceOverride: number | null;
  isActive: boolean;
};

/**
 * Editable shape backing the new-product page. Numeric fields are kept
 * as strings so that controlled inputs never fight the user mid-typing
 * (mirrors the mobile app's `ProductFormValues`). Conversion to numbers
 * happens at submit time.
 */
export type ProductFormValues = {
  name: string;
  description: string;
  basePrice: string;
  stock: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  hasVariants: boolean;
  variantDimensions: VariantDimension[];
  variants: ProductVariantFormRow[];
  /**
   * Dietary / allergen tags the merchant has marked on this product.
   * Optional; defaults to an empty array. See `ProductTag` for the
   * canonical list.
   */
  tags: ProductTag[];
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type Order = {
  id: string;
  businessId: string;
  customerPhone: string;
  customerName: string | null;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paystackRef: string | null;
  paystackAuthUrl: string | null;
  paystackPreviousRefs: string[];
  notes: string | null;
  deliveryAddress: string | null;
  fulfillment: OrderFulfillment;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountId: string | null;
  discountAmount: number;
  discount: OrderDiscount | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

// ---------------------------------------------------------------------------
// Payments — payout account (Paystack subaccount)
// ---------------------------------------------------------------------------

export type PayoutAccountType = "BANK" | "MOBILE_MONEY";

export type PayoutAccount = {
  paystackSubaccountCode: string | null;
  payoutAccountType: PayoutAccountType | null;
  payoutBankCode: string | null;
  payoutBankName: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  payoutConfiguredAt: string | null;
};

export type BankSummary = { code: string; name: string };
export type ResolvedAccount = { accountName: string; accountNumber: string };

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type Customer = {
  id: string;
  businessId: string;
  phone: string;
  name: string | null;
  optedOut: boolean;
  optedOutAt: string | null;
  lastMessageAt: string | null;
  lastOrderAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Broadcasts
// ---------------------------------------------------------------------------

export type BroadcastAudienceBucket =
  | "ALL_CUSTOMERS"
  | "ACTIVE_LAST_30_DAYS"
  | "ACTIVE_LAST_90_DAYS"
  | "IN_24H_WINDOW";

export type BroadcastStatus =
  | "DRAFT"
  | "QUEUED"
  | "SENDING"
  | "SENT"
  | "FAILED";

export type BroadcastRecipientStatus =
  | "PENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "SKIPPED";

export type WhatsappTemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "DISABLED";

export type WhatsappTemplate = {
  id: string;
  businessId: string;
  name: string;
  language: string;
  category: string;
  status: WhatsappTemplateStatus;
  body: string;
  variableCount: number;
  lastSyncedAt: string;
};

export type Broadcast = {
  id: string;
  businessId: string;
  name: string;
  audienceBucket: BroadcastAudienceBucket;
  bodyTemplate: string;
  templateId: string | null;
  templateLanguage: string | null;
  discountId: string | null;
  status: BroadcastStatus;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  template: Pick<WhatsappTemplate, "id" | "name" | "language" | "status"> | null;
  discount: Pick<Discount, "id" | "code" | "type" | "value"> | null;
};

export type BroadcastRecipient = {
  id: string;
  broadcastId: string;
  customerId: string;
  status: BroadcastRecipientStatus;
  whatsappMsgId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Dashboard filtering
// ---------------------------------------------------------------------------

export type DashboardRange =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "THIS_YEAR"
  | "LIFETIME"
  | "CUSTOM";

export type CustomerSegment = "NEW" | "RETURNING";

/** Mirrors the backend DashboardStatsQueryDto. Character-identical enums. */
export type DashboardFilter = {
  range: DashboardRange;
  startDate?: string;
  endDate?: string;
  orderStatus?: OrderStatus;
  conversationStatus?: ConversationStatus;
  customerSegment?: CustomerSegment;
  customerPhone?: string;
  compare?: boolean;
};

type DashboardMetrics = {
  conversations: number;
  orders: number;
  revenue: number;
};

export type DashboardStats = {
  range: { start: string; end: string; label: string };
  metrics: DashboardMetrics;
  previous?: {
    range: { start: string; end: string };
    metrics: DashboardMetrics;
    change: {
      conversations: number | null;
      orders: number | null;
      revenue: number | null;
    };
  };
};

export type DashboardActivityConversation = {
  id: string;
  customerName: string | null;
  customerPhone: string;
  status: ConversationStatus;
  lastMessageAt: string;
};

export type DashboardActivityOrder = {
  id: string;
  customerName: string | null;
  customerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export type DashboardActivity = {
  conversations: DashboardActivityConversation[];
  orders: DashboardActivityOrder[];
};
