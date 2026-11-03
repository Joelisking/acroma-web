export type SuperAdmin = { id: string; email: string; name: string };

export type StartLoginResponse = { pendingToken: string };

export type VerifyTotpResponse = {
  token: string;
  /** ISO timestamp the session ends. */
  expiresAt: string;
  admin: SuperAdmin;
};

/** State returned by the sign-in server actions (`useActionState`). */
export type AdminFormState = { error?: string };

export type Page<T> = { items: T[]; nextCursor: string | null };

export type MerchantRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessType: string;
  currency: string;
  createdAt: string;
  whatsappConnected: boolean;
  paystackConfigured: boolean;
  orders7d: number;
  lastCustomerMessageAt: string | null;
  errors24h: number;
};

export type MerchantDetail = MerchantRow & {
  team: { name: string; email: string; role: string }[];
  staffCount: number;
  aiCost30d: { usd: number };
  conversations30d: number;
  orders30d: number;
};

export type AiDecision = {
  id: string;
  createdAt: string;
  businessId: string;
  conversationId: string;
  episodeSeq: number | null;
  mode: "OFF" | "SHADOW" | "LIVE";
  route: "STRONG" | "CHEAP";
  guardFailed: string | null;
  jevTurnType: string | null;
  jevConfidence: number | null;
  jevEnglish: number | null;
  jevLatencyMs: number | null;
  cheapOutcome: string | null;
  strongAction: string | null;
  costUsd: number | null;
};

export type AuditEntry = {
  id: string;
  businessId: string;
  conversationId: string | null;
  orderId: string | null;
  actorId: string | null;
  actorName: string | null;
  actor: "CUSTOMER" | "AI" | "OWNER" | "ADMIN" | "STAFF" | "SYSTEM";
  eventType: string;
  summary: string;
  createdAt: string;
  impersonatorId: string | null;
  impersonatorName: string | null;
};

export type AppLogEntry = {
  id: string;
  level: string;
  context: string | null;
  message: string;
  stack: string | null;
  businessId: string | null;
  conversationId: string | null;
  orderId: string | null;
  requestId: string | null;
  route: string | null;
  createdAt: string;
  /** Only on the global `/super-admin/logs` list. */
  businessName?: string | null;
};

export type LogGroup = {
  context: string | null;
  message: string;
  level: string;
  count: number;
  lastAt: string;
  /** Distinct merchants affected. */
  businesses: number;
};

export type ActivityEntry = {
  id: string;
  superAdminId: string;
  businessId: string | null;
  action: string;
  summary: string;
  ip: string | null;
  createdAt: string;
  adminName: string;
  businessName: string | null;
};
