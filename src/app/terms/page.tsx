import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of the Lumen customer intelligence platform.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: August 27, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Acceptance">
          <p>
            By accessing or using Lumen (&quot;the Service&quot;), you agree to
            these terms. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Service description">
          <p>
            Lumen is a customer intelligence platform that ingests customer
            data you provide, scores customers using machine-learning models,
            and presents actionable insights and campaign tools. The Service is
            provided as a hosted SaaS application.
          </p>
        </Section>

        <Section title="3. Your data">
          <p>
            You retain all ownership of data you upload to Lumen. We do not
            claim any intellectual property rights over your customer data. You
            grant us a limited license to process your data solely to provide
            the Service.
          </p>
          <p className="mt-2">
            You are responsible for ensuring you have the right to upload and
            process any customer data you provide to the Service.
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Use the Service to send spam or unsolicited communications.
            </li>
            <li>
              Attempt to access other tenants&apos; data or circumvent
              tenant isolation.
            </li>
            <li>
              Reverse-engineer, decompile, or attempt to extract the source
              code of the Service.
            </li>
            <li>Use the Service for any unlawful purpose.</li>
          </ul>
        </Section>

        <Section title="5. ML predictions disclaimer">
          <p>
            Lumen&apos;s machine-learning scores and recommendations are
            probabilistic estimates, not guarantees. Churn-risk scores,
            expected-value predictions, and SHAP explanations are provided as
            decision-support tools. You are responsible for the business
            decisions you make based on these outputs.
          </p>
        </Section>

        <Section title="6. Availability">
          <p>
            We aim for high availability but do not guarantee uninterrupted
            service. Planned maintenance will be communicated in advance when
            possible. The Service is provided on a best-effort basis during
            this demo/beta period.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Lumen and its operators
            shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Service,
            including but not limited to lost revenue, lost data, or business
            interruption.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            We may suspend or terminate your access if you violate these
            terms. You may stop using the Service at any time. Upon
            termination, your data will be handled according to our{" "}
            <Link
              href="/privacy"
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="9. Changes to these terms">
          <p>
            We may update these terms. Material changes will be communicated
            via the email on your account. Continued use after notification
            constitutes acceptance.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These terms are governed by the laws of India. Any disputes arising
            from or related to these terms or the Service shall be subject to
            the exclusive jurisdiction of the courts in Bengaluru, Karnataka,
            India.
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground/70">
            [Lawyer review: confirm jurisdiction choice. If users are primarily
            in Brazil, consider Brazilian consumer protection law (CDC) which
            may override this clause for Brazilian consumers.]
          </p>
        </Section>

        <Section title="11. Dispute resolution">
          <p>
            Before filing any legal claim, both parties agree to attempt
            resolution through good-faith negotiation for at least 30 days.
            Either party may initiate this by sending a written description of
            the dispute to the other party&apos;s contact email.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions? Email{" "}
            <a
              href="mailto:parshvijain1505@gmail.com"
              className="underline hover:text-foreground"
            >
              parshvijain1505@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
