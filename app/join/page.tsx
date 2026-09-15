import Link from "next/link";
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { JoinForm } from "@/components/auth/join-form";
import { InviteDeadEnd } from "@/components/auth/invite-dead-end";
import { lookupInvite } from "@/lib/api/team";

export const metadata: Metadata = { title: "Join a business · Acroma" };

/**
 * Where an invite link lands. Public and deliberately outside the (auth)
 * route group: an owner who opens their own link to check it should see the
 * page, not get bounced to the dashboard.
 */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const lookup = await lookupInvite(token);

  if (lookup.state !== "ok") {
    return (
      <AuthShell
        eyebrow="Invite"
        headline={
          <>
            This link
            <br />
            <span className="text-brand-orange">doesn&apos;t work.</span>
          </>
        }
        body="Invite links are single use and last 24 hours. Ask the person who invited you to send a new one."
        footer={
          <span>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-orange font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </span>
        }
      >
        <InviteDeadEnd
          reason={
            lookup.state === "dead"
              ? lookup.reason
              : "We couldn't find an invite for this link."
          }
        />
      </AuthShell>
    );
  }

  const { businessName } = lookup.preview;

  return (
    <AuthShell
      eyebrow="You're invited"
      headline={
        <>
          Join{" "}
          <span className="text-brand-orange">{businessName}</span>
          <br />
          on Acroma.
        </>
      }
      body="Create your own login and you'll have full access to the business: orders, chats, catalog, payments and settings."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-orange font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <JoinForm token={token} businessName={businessName} />
    </AuthShell>
  );
}
