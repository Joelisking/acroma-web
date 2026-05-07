import { ExternalLink } from "lucide-react";

import { WhatsappGuideStep } from "@/components/settings/whatsapp-guide-step";
import { cn } from "@/lib/utils";

/**
 * End-to-end Meta WhatsApp Cloud API setup walkthrough, accurate to the
 * Business Manager + App Dashboard layout as of 2025/2026.
 */
export function WhatsappGuide() {
  return (
    <div className="space-y-4">
      <Callout>
        <strong className="text-foreground font-medium">Before you start.</strong>{" "}
        You&apos;ll need a Meta business account, admin access to it, and a
        phone number that&apos;s <em>not</em> currently signed into the regular
        WhatsApp or WhatsApp Business mobile apps.
      </Callout>

      <WhatsappGuideStep index={1} title="Create a Meta App">
        <p>
          Go to{" "}
          <ExtLink href="https://developers.facebook.com/apps">
            developers.facebook.com/apps
          </ExtLink>{" "}
          and click <strong>Create app</strong>.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Use case: <strong>Other</strong>.
          </li>
          <li>
            App type: <strong>Business</strong>.
          </li>
          <li>
            Give it a name (anything — e.g. &ldquo;Acroma WhatsApp&rdquo;) and
            link it to the business account that will own your number.
          </li>
        </ul>
      </WhatsappGuideStep>

      <WhatsappGuideStep index={2} title="Add the WhatsApp product">
        <p>
          On the new app&apos;s dashboard, scroll to{" "}
          <strong>Add a product</strong>, find <strong>WhatsApp</strong>, and
          click <strong>Set up</strong>. This creates your{" "}
          <strong>WhatsApp Business Account (WABA)</strong> — the container
          your business number will live under.
        </p>
      </WhatsappGuideStep>

      <WhatsappGuideStep index={3} title="Register your business phone number">
        <p>
          In the left sidebar go to{" "}
          <strong>WhatsApp → API setup</strong> and click{" "}
          <strong>Add phone number</strong>. Use a number that is{" "}
          <em>not</em> currently active on the regular WhatsApp or WhatsApp
          Business mobile apps.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Verify it via SMS or voice call.</li>
          <li>
            Set your <strong>display name</strong> — this is what your
            customers see. Meta reviews it for approval.
          </li>
          <li>
            Submit your business for{" "}
            <ExtLink href="https://www.facebook.com/business/help/2058515294227817">
              business verification
            </ExtLink>
            . It&apos;s required before you can message at production volume.
          </li>
        </ul>
      </WhatsappGuideStep>

      <WhatsappGuideStep
        index={4}
        title="Copy your Phone Number ID and WABA ID"
      >
        <p>
          Still on <strong>WhatsApp → API setup</strong>, with your registered
          number selected in the &ldquo;From&rdquo; dropdown:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Phone number ID</strong> — shown under the &ldquo;From&rdquo;
            dropdown.
          </li>
          <li>
            <strong>WhatsApp Business Account ID</strong> — listed just below
            it.
          </li>
        </ul>
        <PasteHint>
          Paste both into Acroma&apos;s <em>Credentials</em> card.
        </PasteHint>
      </WhatsappGuideStep>

      <WhatsappGuideStep
        index={5}
        title="Create a System User and assign assets"
      >
        <p>
          Acroma needs a long-lived access token to keep messaging from your
          number without re-auth. Generate one via a System User.
        </p>
        <p>
          Open{" "}
          <ExtLink href="https://business.facebook.com/settings">
            Business Settings
          </ExtLink>{" "}
          → <strong>Users → System users</strong> → <strong>Add</strong>. Name
          it (e.g. &ldquo;Acroma&rdquo;) and pick the <strong>Admin</strong>{" "}
          role.
        </p>
        <p>
          With the new system user selected, click{" "}
          <strong>Assign assets</strong> and add:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Your <strong>WhatsApp account</strong> (WABA) with{" "}
            <strong>Full control</strong>.
          </li>
          <li>
            The <strong>app</strong> you created in step&nbsp;1 with{" "}
            <strong>Full control</strong>.
          </li>
        </ul>
      </WhatsappGuideStep>

      <WhatsappGuideStep index={6} title="Generate the access token">
        <p>
          Still on the system user, click{" "}
          <strong>Generate new token</strong>.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>App: pick the one from step&nbsp;1.</li>
          <li>
            Expiration: <strong>Never</strong>.
          </li>
          <li>
            Permissions: tick{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              whatsapp_business_messaging
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              whatsapp_business_management
            </code>
            .
          </li>
        </ul>
        <p className="text-brand-orange">
          Copy the token immediately — Meta only shows it once.
        </p>
        <PasteHint>
          Paste the token into Acroma&apos;s <em>Access token</em> field.
        </PasteHint>
      </WhatsappGuideStep>

      <WhatsappGuideStep index={7} title="Connect the webhook">
        <p>
          Back in the App Dashboard, go to{" "}
          <strong>WhatsApp → Configuration → Webhook → Edit</strong>.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Callback URL</strong>: paste the <em>Webhook URL</em>{" "}
            from Acroma&apos;s settings page.
          </li>
          <li>
            <strong>Verify token</strong>: paste the <em>Verify token</em>{" "}
            from the same card.
          </li>
        </ul>
        <p>
          Click <strong>Verify and save</strong>. Then in{" "}
          <strong>Webhook fields</strong>, find <code>messages</code> and
          click <strong>Subscribe</strong> so inbound messages reach Acroma.
        </p>
      </WhatsappGuideStep>
    </div>
  );
}

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

function PasteHint({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "border-brand-orange bg-muted/40 text-muted-foreground",
        "rounded-r-md border-l-2 px-3 py-2 text-sm",
      )}
    >
      <span className="text-brand-orange font-medium">Paste back: </span>
      {children}
    </p>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-2xl border p-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}
