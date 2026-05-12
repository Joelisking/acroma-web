import {
  Bike,
  CreditCard,
  Clock,
  MapPin,
  RotateCcw,
  Boxes,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { FaqCategory } from "@/lib/api/faq";

export type CategoryMeta = {
  label: string;
  icon: LucideIcon;
};

export const FAQ_CATEGORY_META: Record<FaqCategory, CategoryMeta> = {
  DELIVERY: { label: "Delivery", icon: Bike },
  PAYMENT: { label: "Payment", icon: CreditCard },
  HOURS: { label: "Hours", icon: Clock },
  LOCATION: { label: "Location", icon: MapPin },
  RETURNS: { label: "Returns & guarantees", icon: RotateCcw },
  WHOLESALE: { label: "Wholesale & discounts", icon: Boxes },
  OTHER: { label: "Other", icon: HelpCircle },
};

// Stable display order for category groups in the UI.
export const CATEGORY_ORDER: FaqCategory[] = [
  "DELIVERY",
  "PAYMENT",
  "HOURS",
  "LOCATION",
  "RETURNS",
  "WHOLESALE",
  "OTHER",
];
