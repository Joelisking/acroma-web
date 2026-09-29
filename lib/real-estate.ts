import { z } from "zod"

export const propertyStatus = z.enum([
  "AVAILABLE",
  "UNDER_OFFER",
  "SOLD",
  "ARCHIVED",
])
export const appointmentKind = z.enum(["VIEWING", "CONSULTATION"])
export const appointmentStatus = z.enum([
  "HOLD",
  "CONFIRMED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
])
export const estatePaymentStatus = z.enum([
  "UNPAID",
  "PAID",
  "REFUND_REQUIRED",
  "REFUNDED",
])
export const estateRefundStatus = z.enum([
  "REQUESTED",
  "UNKNOWN",
  "PENDING",
  "PROCESSING",
  "NEEDS_ATTENTION",
  "COMPLETED",
  "FAILED",
  "REVIEW_REQUIRED",
])
export const estateRefundSchema = z.object({
  id: z.string(),
  status: estateRefundStatus,
  failureCode: z.string().nullable(),
  requestedAt: z.string(),
  completedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  canRetry: z.boolean(),
})
export const listingInput = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().max(4000),
  location: z.string().trim().min(2).max(150),
  propertyType: z.string().trim().min(2).max(80),
  askingPrice: z.number().positive().max(99999999999999).multipleOf(0.01),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code"),
  bedrooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(100).optional(),
  imageUrls: z.array(z.url().startsWith("https://")).max(20),
  status: propertyStatus,
})
export const listingSchema = listingInput.extend({
  id: z.string(),
  businessId: z.string(),
  askingPrice: z.coerce.number(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Listing = z.infer<typeof listingSchema>
export type ListingInput = z.infer<typeof listingInput>
export const estateSettingsInput = z.object({
  viewingFee: z.number().min(0).max(1000000).multipleOf(0.01),
  consultationFee: z.number().min(0).max(1000000).multipleOf(0.01),
  viewingDurationMinutes: z.number().int().min(15).max(480),
  consultationDurationMinutes: z.number().int().min(15).max(480),
})
export const estateCalendarViewInput = z.object({
  defaultCalendarView: z.enum(["WEEK", "DAY", "MONTH"]),
})
export const estateSettingsSchema = estateSettingsInput.extend({
  currency: z.string(),
  defaultCalendarView:
    estateCalendarViewInput.shape.defaultCalendarView.default("WEEK"),
})
export type EstateSettings = z.infer<typeof estateSettingsSchema>
export const bookingInput = z.object({
  expectedFee: z.number().min(0).optional(),
  expectedCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  expectedDurationMinutes: z.number().int().min(15).max(480).optional(),
  kind: appointmentKind,
  propertyId: z.uuid().optional(),
  startsAt: z.iso.datetime({ offset: true }),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Use an international phone number"),
  requestKey: z.string().min(8).max(150),
})
export const appointmentSchema = z.object({
  id: z.string(),
  propertyId: z.string().nullable(),
  kind: appointmentKind,
  status: appointmentStatus,
  customerName: z.string(),
  customerPhone: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  fee: z.number(),
  currency: z.string(),
  holdExpiresAt: z.string().nullable(),
  paymentStatus: estatePaymentStatus,
  paymentUrl: z.string().nullable(),
  updatedAt: z.string(),
  refund: estateRefundSchema.nullable().default(null),
})
export const availabilitySchema = z.object({
  slots: z.array(z.string()),
  durationMinutes: z.number(),
  fee: z.number(),
  currency: z.string(),
  timeZone: z.string(),
})
export const paymentStateSchema = appointmentSchema
  .pick({
    status: true,
    paymentStatus: true,
    startsAt: true,
    endsAt: true,
    fee: true,
    currency: true,
    holdExpiresAt: true,
  })
  .extend({ refundStatus: estateRefundStatus.nullable().default(null) })
export type Appointment = z.infer<typeof appointmentSchema>
export type Availability = z.infer<typeof availabilitySchema>
export type PaymentState = z.infer<typeof paymentStateSchema>
export const estateTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  }).format(new Date(value))
export const estateMoney = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
