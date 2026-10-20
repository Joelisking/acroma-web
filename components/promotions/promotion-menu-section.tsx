"use client"

import { CatalogImagesManager } from "@/components/catalog/catalog-images-manager"
import { CatalogPdfManager } from "@/components/catalog/catalog-pdf-manager"
import { updatePromotionAction } from "@/lib/api/promotions-actions"
import type { Promotion } from "@/lib/api/types"

/** The promotion's own menu, uploaded the same way as the regular one. */
export function PromotionMenuSection({ promotion }: { promotion: Promotion }) {
  return (
    <div className="space-y-6">
      <CatalogPdfManager
        noun="Promo menu"
        defaultUrl={promotion.menuPdfUrl}
        onSave={async (menuPdfUrl) => {
          const r = await updatePromotionAction(promotion.id, { menuPdfUrl })
          return r.ok ? { ok: true, data: r.data.menuPdfUrl } : r
        }}
      />
      <CatalogImagesManager
        noun="Promo menu"
        defaultUrls={promotion.menuImageUrls}
        onSave={async (menuImageUrls) => {
          const r = await updatePromotionAction(promotion.id, { menuImageUrls })
          return r.ok ? { ok: true, data: r.data.menuImageUrls } : r
        }}
      />
    </div>
  )
}
