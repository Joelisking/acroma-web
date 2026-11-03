import type { Metadata } from "next";
import Link from "next/link";

import { MerchantTabs } from "@/components/admin/merchant/merchant-tabs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getMerchant } from "@/lib/admin/queries";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  const merchant = await getMerchant(id);
  return { title: `${merchant.name} · Admin · Acroma` };
}

export default async function MerchantLayout({ children, params }: Props) {
  const { id } = await params;
  const merchant = await getMerchant(id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">{merchant.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {merchant.email}
            <Badge variant="outline">{merchant.businessType}</Badge>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/activity?businessId=${merchant.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Admin activity
          </Link>
          <form method="post" action="/api/admin/impersonate">
            <input type="hidden" name="businessId" value={merchant.id} />
            <Button type="submit">Log in as</Button>
          </form>
        </div>
      </header>
      <MerchantTabs id={merchant.id} />
      {children}
    </div>
  );
}
