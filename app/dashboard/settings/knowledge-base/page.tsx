import type { Metadata } from "next";
import { SettingsCard } from "@/components/settings/settings-card";
import { listFaqEntries } from "@/lib/api/faq";
import { KnowledgeBaseManager } from "@/components/settings/knowledge-base/knowledge-base-manager";
import { redirectStaffHome } from "@/lib/api/owner-only";

export const metadata: Metadata = {
  title: "Knowledge base · Settings · Acroma",
};

export default async function KnowledgeBasePage() {
  await redirectStaffHome();

  const entries = await listFaqEntries();

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Knowledge base"
        description="Common questions customers ask. Acroma uses the answers below as the source of truth. Switch one on once the answer is right for your business."
      >
        <KnowledgeBaseManager initialEntries={entries} />
      </SettingsCard>
    </div>
  );
}
