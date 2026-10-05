import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
export const metadata: Metadata = {
  title: "Data deletion · Acroma",
}
export default function DataDeletionPage() {
  return (
    <LegalPage title="Request data deletion">
      <p>
        To request deletion of information held by Acroma, email{" "}
        <a
          className="text-primary underline"
          href="mailto:info@asera.tech?subject=Acroma%20data%20deletion%20request"
        >
          info@asera.tech
        </a>{" "}
        with the subject “Acroma data deletion request”. Acroma is operated by
        Dysruptive Technologies.
      </p>
      <section>
        <h2 className="text-lg font-semibold">What to include</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Whether you are a merchant account owner or a customer.</li>
          <li>
            The merchant or business involved and the email address or phone
            number associated with the records.
          </li>
          <li>
            Which records or account you want deleted, and a way to contact you.
          </li>
        </ul>
        <p>
          Do not send passwords, access tokens, payment PINs or identity
          documents unless we specifically request appropriate verification
          through an agreed channel.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">What happens next</h2>
        <p>
          We review the request, verify identity and authority where needed, and
          determine which Acroma records it covers. We will explain the outcome
          and any records that must remain for operational or applicable
          recordkeeping requirements. We do not promise a fixed completion time
          before reviewing the request.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">
          Other copies and disconnection
        </h2>
        <p>
          Removing Acroma’s access in Meta does not itself delete existing
          Acroma records. Deleting records in Acroma does not automatically
          remove copies held by the merchant, Meta, payment providers or a
          recipient’s device. Contact those parties separately where needed.
        </p>
      </section>
    </LegalPage>
  )
}
