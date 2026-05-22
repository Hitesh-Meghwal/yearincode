import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — yearincode",
  description: "How yearincode handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="text-sm text-neutral-500">Last updated 2026-05-22.</p>

      <h2 className="text-xl font-semibold mt-8">What we collect</h2>
      <p>
        When you sign in with GitHub, yearincode receives the GitHub data your
        OAuth approval grants us: your username, avatar, public profile,
        organization memberships you&apos;ve agreed to share, and commit
        metadata (timestamps, repository names, additions/deletions, commit
        message subject lines). We use this to compute your wrapped
        statistics.
      </p>
      <p>
        We do <strong>not</strong> read, store, or transmit the contents of
        your source code. We only look at commit metadata.
      </p>

      <h2 className="text-xl font-semibold mt-8">What we store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>
          Your computed wrapped statistics (the JSON in
          <code className="font-mono"> wrapped_reports.stats_json</code>).
        </li>
        <li>The longest and shortest commit message subject lines that contributed to your stats.</li>
        <li>Your Supabase auth session and an encrypted-at-rest copy of your GitHub OAuth token (used to refresh data if you regenerate).</li>
        <li>An anonymous view count per shared wrapped.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">What we don&apos;t store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Source code or file contents.</li>
        <li>Sensitive commit history beyond the metadata above.</li>
        <li>Marketing identifiers, fingerprints, or third-party trackers.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">Where it lives</h2>
      <p>
        Data is hosted on Supabase (Postgres) and the app runs on Vercel.
        Both apply standard transport and at-rest encryption.
      </p>

      <h2 className="text-xl font-semibold mt-8">Sharing</h2>
      <p>
        Wrappeds are <strong>public by default</strong> — anyone with the URL
        can view them. You can delete your wrapped at any time from
        <a href="/me" className="underline"> /me</a>, which removes the row
        and invalidates the share URL.
      </p>
      <p>
        We don&apos;t sell your data, and we don&apos;t share it with third
        parties beyond the infrastructure providers above.
      </p>

      <h2 className="text-xl font-semibold mt-8">Revoking access</h2>
      <p>
        You can revoke yearincode&apos;s access to your GitHub account at any
        time at <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="underline">github.com/settings/applications</a>. This stops future data fetches; to delete data we already
        have, also delete your wrapped from <a href="/me" className="underline">/me</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8">Contact</h2>
      <p>
        Questions or deletion requests outside the in-app flow: open an issue
        on the project repo or email the listed contact.
      </p>
    </>
  );
}
