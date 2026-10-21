import { LEGAL_POLICY_VERSION } from "@/lib/legal-policy"
import { SupportLinks } from "@/components/support/support-links"
import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/legal/legal-page"
export const metadata: Metadata = {
  title: "Privacy · Acroma",
}
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Effective date and policy version: {LEGAL_POLICY_VERSION}</p>
      <section>
        <h2 className="text-lg font-semibold">Who operates Acroma</h2>
        <p>
          Acroma is operated by Dysruptive Technologies. Acroma helps merchants
          manage customer conversations, catalogs, orders and payments. Contact
          us at{" "}
          <a className="text-primary underline" href="mailto:info@asera.tech">
            info@asera.tech
          </a>
          .
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Information we process</h2>
        <p>
          We process merchant account and business details, connected WhatsApp
          account identifiers and credentials, customer contact details,
          messages and attachments, catalog information, orders, delivery or
          appointment details, payment references, and service activity records.
          The information involved depends on how a merchant uses Acroma and
          what customers share.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">How information is used</h2>
        <p>
          We use this information to provide messaging and order management,
          assist with customer requests, track payment outcomes, secure accounts
          and troubleshoot the service. Authorized merchant users can access
          their business conversations and records.
        </p>
        <p>
          AI-assisted features send relevant conversation and business
          information to the AI services configured for Acroma. AI responses can
          be inaccurate; merchants can review conversations and take over
          replies. Avoid sending passwords, payment PINs or unnecessary
          sensitive information in chat.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Ongoing improvement and possible future model training
        </h2>
        <p>
          We use chats, attachments, feedback and related service records on an
          ongoing basis to investigate errors, assess response quality and
          improve Acroma’s reliability, workflows and customer experience,
          within the purposes permitted for that data. This can include review
          by authorized personnel and evaluation of system behavior.
        </p>
        <p>
          We may in the future use eligible chat data to develop, train,
          fine-tune or evaluate models supporting Acroma. This notice describes
          that possibility; it does not mean every chat is currently used for
          training. Before introducing such use, we will determine the
          applicable legal basis, respect customer rights and platform
          restrictions, apply appropriate data safeguards, and provide any
          additional notice or obtain any consent required.
        </p>
        <p>
          Accepting the signup policies does not authorize uses prohibited by
          WhatsApp, Meta or another provider, and does not substitute for
          customer consent where required. Restrictions can also apply to
          anonymized, aggregated or derived data. Where permitted and
          appropriate, we will minimize personal information and remove
          identifiers before model-development use.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Services involved</h2>
        <p>
          WhatsApp messaging uses Meta services. Payment collection uses
          Paystack. Infrastructure, storage, email and AI service providers
          process information needed to operate the relevant features. These
          providers and the merchant may also hold records under their own
          policies. Acroma does not need your WhatsApp or Meta login password;
          connection authorization happens through Meta.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Storage and access</h2>
        <p>
          Service records are stored to support merchant operations, security
          and support. Retention depends on the record and operational
          requirements. Deletion is handled by request; this notice does not
          promise automatic deletion on disconnection or a fixed deletion
          deadline. Access controls restrict business records to authorized
          users. Connecting WhatsApp does not make one merchant’s records
          available to another.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Requests and questions</h2>
        <p>
          Contact info@asera.tech to ask about access, correction or deletion.
          We may request information to verify your identity and authority. You
          may also ask about or object to improvement-related processing, and
          withdraw consent where processing relies on it, subject to applicable
          law. Customers can also contact the merchant they messaged. See our{" "}
          <Link className="text-primary underline" href="/data-deletion">
            data deletion instructions
          </Link>
          .
        </p>
      </section>
      <p>
        Contact support on <SupportLinks />
      </p>
    </LegalPage>
  )
}
