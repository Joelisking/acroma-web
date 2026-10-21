import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/legal/legal-page"
import { SupportLinks } from "@/components/support/support-links"
import { LEGAL_POLICY_VERSION } from "@/lib/legal-policy"

export const metadata: Metadata = { title: "Terms of Use · Acroma" }

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>Effective date and policy version: {LEGAL_POLICY_VERSION}</p>
      <section>
        <h2 className="text-lg font-semibold">Your agreement with Acroma</h2>
        <p>
          Acroma is operated by Dysruptive Technologies. By selecting the
          agreement checkbox when creating an account, you agree to these Terms
          of Use and acknowledge the{" "}
          <Link className="text-primary underline" href="/privacy">
            Privacy Policy
          </Link>
          . If you register for a business, you confirm you have authority to
          act for it.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Your account and responsibilities
        </h2>
        <p>
          Provide accurate business information, protect your login, and give
          access only to authorized people. You are responsible for your
          catalog, prices, customer communications, orders, fulfillment, refunds
          and the conduct of your account users. Tell us if you suspect
          unauthorized access.
        </p>
        <p>
          You must have the rights and permissions needed to connect your
          messaging accounts and process customer information. Provide customers
          with appropriate privacy notices and obtain any required consent. A
          merchant accepting these terms does not provide consent on behalf of
          every customer.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Messaging, payments and other providers
        </h2>
        <p>
          Meta, WhatsApp, Paystack and other connected providers have their own
          terms, approvals, charges and availability requirements. Follow their
          applicable rules, including message opt-in, template and
          service-window requirements. Do not use Acroma for spam, fraud,
          unlawful sales, harassment or unauthorized access.
        </p>
        <p>
          You authorize Acroma to access the connected accounts and process
          messages, attachments, business records and payment references as
          needed to provide the features you request. Payment processing and
          settlement depend on the payment provider. Disconnecting a messaging
          account stops its integration with Acroma; it does not delete existing
          records or automatically revoke permissions in the provider’s systems.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          AI assistance and your oversight
        </h2>
        <p>
          AI replies and generated information can be inaccurate. Review your
          business configuration and important customer outcomes, and use human
          takeover when needed. Acroma does not guarantee every reply, order or
          payment will succeed. You remain responsible for decisions made using
          the service.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Chats, service improvement and possible model training
        </h2>
        <p>
          As explained in the Privacy Policy, chats and related service records
          are used on an ongoing basis to troubleshoot issues, evaluate quality
          and improve Acroma’s reliability, workflows and responses, within the
          purposes and permissions allowed for the data.
        </p>
        <p>
          We may in the future use eligible chat data to develop, train,
          fine-tune or evaluate models supporting Acroma. This is subject to
          applicable law, customer rights, platform and provider terms,
          appropriate safeguards and any additional notice or consent required.
          Accepting these terms is not a blanket authorization to train on all
          chats and does not override restrictions on WhatsApp or other platform
          data.
        </p>
        <p>
          You retain your rights in the information you provide. These terms
          grant permission to process it for the disclosed, permitted service
          purposes; they do not transfer ownership of your customer records to
          Acroma.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Fees, availability and ending use
        </h2>
        <p>
          Any Acroma subscription or usage fees will be presented before you
          agree to the relevant paid service. Third-party messaging and payment
          charges may apply separately. Availability depends in part on external
          providers, and interruptions can occur.
        </p>
        <p>
          You can stop using Acroma and request account closure or data deletion
          through support. We may restrict access to protect accounts, comply
          with law or provider requirements, or address misuse. Records may
          remain where needed for permitted operational or legal purposes, as
          described in the Privacy Policy and{" "}
          <Link className="text-primary underline" href="/data-deletion">
            data deletion instructions
          </Link>
          .
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Changes, questions and disputes
        </h2>
        <p>
          We will publish updated terms with a new version and provide notice of
          material changes. Where additional agreement or consent is required,
          we will request it before applying the relevant change. Nothing here
          removes rights that applicable law does not allow to be excluded.
          Contact support first about questions or disputes: <SupportLinks />
        </p>
      </section>
    </LegalPage>
  )
}
