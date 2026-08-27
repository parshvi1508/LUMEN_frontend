import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Lumen collects, uses, and protects your data. Essential cookies only, tenant-scoped access, no selling of data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: August 27, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. What we collect">
          <p>
            When you sign in with Google, we receive your name, email address,
            and profile picture from Google OAuth. We do not access your Google
            contacts, calendar, or any other Google data.
          </p>
          <p className="mt-2">
            You may upload customer data (names, emails, order history) to the
            platform. This data is stored in your tenant workspace and is never
            shared with other tenants.
          </p>
        </Section>

        <Section title="2. How we use it">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Authentication:</strong> your Google profile identifies
              your account.
            </li>
            <li>
              <strong>ML scoring:</strong> uploaded customer data is processed
              by our machine-learning pipeline to generate churn-risk scores,
              value predictions, and SHAP-based explanations.
            </li>
            <li>
              <strong>Dashboards and campaigns:</strong> we display your data
              back to you and use it to power segment-based campaigns you
              create.
            </li>
          </ul>
          <p className="mt-2">
            We do not sell, rent, or share your data with third parties for
            marketing purposes.
          </p>
        </Section>

        <Section title="3. Where data is stored">
          <ul className="list-disc space-y-1 pl-5">
            <li>Database: Supabase (PostgreSQL), hosted on AWS.</li>
            <li>Backend API: Render (US region).</li>
            <li>Frontend: Vercel (edge network).</li>
            <li>
              ML models run server-side on Render. LLM calls go through Groq
              and OpenRouter (no customer PII is sent to LLM providers).
            </li>
          </ul>
        </Section>

        <Section title="4. Tenant isolation">
          <p>
            All data is scoped to your tenant. API endpoints enforce tenant
            boundaries at the authentication layer. You cannot access another
            tenant&apos;s customers, segments, or campaigns.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            We use essential cookies only: a Supabase authentication session
            cookie and a cookie-consent preference stored in localStorage. We
            do not use tracking cookies, advertising pixels, or third-party
            analytics cookies.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by emailing{" "}
            <a
              href="mailto:parshvijain1505@gmail.com"
              className="underline hover:text-foreground"
            >
              parshvijain1505@gmail.com
            </a>
            . We will respond within 15 business days.
          </p>
          <p className="mt-2">
            If you are located in Brazil, you have additional rights under the
            LGPD, including the right to data portability and the right to
            request anonymization of unnecessary data.
          </p>
        </Section>

        <Section title="7. Data retention">
          <p>
            Account data is retained while your account is active. If you
            delete your account, we will remove your personal data within 30
            days. Uploaded customer data is deleted immediately upon account
            deletion.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will
            be communicated via the email on your account. Continued use after
            notification constitutes acceptance.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about this policy? Email{" "}
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
