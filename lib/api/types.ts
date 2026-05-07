/**
 * Shapes mirrored from the Acroma backend (NestJS).
 * Keep in sync with backend DTOs / Prisma `select` returns.
 *
 * Source of truth: /Users/joel/Documents/acroma-backend/src/**
 */

export type Business = {
  id: string;
  name: string;
  email: string;
  currency: string;
  country: string;
  logoUrl: string | null;
  whatsappPhoneNumberId: string | null;
  whatsappWebhookActive: boolean;
  aiEnabled: boolean;
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
  createdAt: string;
  updatedAt: string;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type HandoffAction = "TAKE_OVER" | "RESUME_AI";

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
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
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};
