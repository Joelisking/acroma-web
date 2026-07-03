import { z } from "zod";

const seriesPoint = z
  .object({ bucket: z.string() })
  .catchall(z.union([z.number(), z.string()]));

export const productRevenueReportSchema = z.object({
  range: z.object({ start: z.string(), end: z.string(), label: z.string() }),
  currency: z.string(),
  totalRevenue: z.number(),
  bucket: z.union([z.literal("hour"), z.literal("day")]),
  products: z.array(
    z.object({
      productId: z.string().nullable(),
      name: z.string(),
      revenue: z.number(),
      unitsSold: z.number(),
      orderCount: z.number(),
      pctOfTotal: z.number(),
    }),
  ),
  seriesKeys: z.array(z.string()),
  series: z.array(seriesPoint),
});
