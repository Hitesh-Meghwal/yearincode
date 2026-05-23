import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — yearincode",
  description: "How yearincode handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="text-sm text-neutral-500">Last updated 2026-05-23.</p>

      <h2 className="text-xl font-semibold mt-8">What we collect</h2>
      <p>
        When you sign in with GitHub, yearincode requests <strong>read-only
        access to your public repositories</strong> (<code className="font-mono">public_repo</code> scope) plus your basic profile and
        organization memberships you&apos;ve agreed to share. We do{" "}
        <strong>not</strong> request access to your private repositories,
        and we cannot write anything to your GitHub account.
      </p>
      <p>
        From those public repositories we read commit metadata only:
        timestamps, repository names, additions/deletions, and commit
        message subject lines. We use this to compute your wrapped
        statistics.
      </p>
      <p>
        We do <strong>not</strong> read, store, or transmit the contents of
        your source code. Only commit metadata.
      </p>

      <h2 className="text-xl font-semibold mt-8">What we store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Your computed wrapped statistics for each year you generate.</li>
        <li>
          The longest and shortest commit message subject lines that
          contributed to those stats.
        </li>
        <li>
          Your authenticated session and an encrypted-at-rest copy of your
          GitHub OAuth token, used to refresh data when you regenerate.
        </li>
        <li>An anonymous view count per shared wrapped.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">What we don&apos;t store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Source code or file contents.</li>
        <li>Anything beyond the commit metadata listed above.</li>
        <li>Marketing identifiers, fingerprints, or third-party trackers.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">Sharing</h2>
      <p>
        Wrappeds are <strong>public by default</strong>. Anyone with the URL
        can view them. You can delete a wrapped at any time from{" "}
        <a href="/me" className="underline">
          /me
        </a>
        , which removes the row and invalidates the share URL.
      </p>
      <p>We don&apos;t sell your data and we don&apos;t share it with third parties.</p>

      <h2 className="text-xl font-semibold mt-8">Revoking access</h2>
      <p>
        You can revoke yearincode&apos;s access to your GitHub account at any
        time at{" "}
        <a
          href="https://github.com/settings/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          github.com/settings/applications
        </a>
        . That stops future data fetches; to delete data we already have, also
        delete your wrapped from{" "}
        <a href="/me" className="underline">
          /me
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-8">Contact</h2>
      <p>
        For privacy questions or deletion requests outside the in-app flow,
        reach out to{" "}
        <a
          href="https://github.com/Hitesh-Meghwal"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          @Hitesh-Meghwal
        </a>{" "}
        on GitHub.
      </p>
    </>
  );
}
