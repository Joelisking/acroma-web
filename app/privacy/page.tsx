import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/legal/legal-page"
export const metadata: Metadata = {
  title: "Privacy · Acroma",
}
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
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
          We may request information to verify your identity and authority.
          Customers can also contact the merchant they messaged. See our{" "}
          <Link className="text-primary underline" href="/data-deletion">
            data deletion instructions
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  )
}
