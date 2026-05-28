import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — yearincode",
  description: "How yearincode handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="text-sm text-neutral-500">Last updated 2026-05-24.</p>

      <h2 className="text-xl font-semibold mt-8">Three ways to generate</h2>
      <p>There are three ways to make a wrapped, and they differ in what they touch:</p>
      <ul className="list-disc list-inside space-y-2 mt-2">
        <li>
          <strong>Username (no sign-in)</strong> — you type any GitHub
          username and we read that account&apos;s <strong>public</strong>{" "}
          commit metadata using our own app-level token. No login, no access to
          anything private. This is the same public data anyone can already see
          on that account&apos;s GitHub profile.
        </li>
        <li>
          <strong>Sign in with GitHub</strong> — grants us <strong>read-only
          access to your public repositories</strong> (<code className="font-mono">public_repo</code> scope) plus your basic profile.
          We <strong>cannot</strong> read your private repositories and{" "}
          <strong>cannot </strong> write anything to your account. If you&apos;ve
          enabled &quot;include private contributions on my profile&quot; in
          GitHub, the aggregate counts GitHub already publishes flow through too.
        </li>
        <li>
          <strong>Personal access token (optional, for private repos)</strong> —
          you paste a token you created yourself, with whatever scopes you chose
          (a read-only token is enough). We use it <strong>once</strong> to read
          your stats, then <strong>discard it</strong>. We never write it to our
          database. It is not stored.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">What we read</h2>
      <p>
        Commit metadata only: timestamps, repository names, additions/deletions,
        and commit message subject lines. We use this to compute your wrapped
        statistics.
      </p>
      <p>
        We do <strong>not</strong> read, store, or transmit the contents of your
        source code. Ever. Only commit metadata.
      </p>
      <p>
        For private repositories (token mode only), the data never leaves the
        aggregate: your public share page shows <strong>counts and totals</strong>,
        never a private repository name, never a commit message, never code.
        Private repos appear only as anonymized contributions to the big numbers.
      </p>

      <h2 className="text-xl font-semibold mt-8">What we store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>
          Your computed wrapped statistics for each wrap generated — whether a
          single year or the all-time (&quot;Since Day One&quot;) recap.
        </li>
        <li>
          The longest and shortest commit message subject lines that contributed
          to those stats (these are not rendered on the public page).
        </li>
        <li>
          <strong>If you signed in:</strong> your authenticated session and a
          copy of your GitHub OAuth token, used to refresh data when you
          regenerate. <strong>If you used a pasted token or username mode:</strong>{" "}
          nothing about your token is stored.
        </li>
        <li>An anonymous view count per shared wrapped.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">What we don&apos;t store</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Source code or file contents.</li>
        <li>Anything beyond the commit metadata listed above.</li>
        <li>Marketing identifiers, fingerprints, or third-party trackers.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">Sharing &amp; ownership</h2>
      <p>
        Wrappeds are <strong>public by default</strong> — anyone with the URL can
        view them, and they&apos;re built from data that is already public on
        GitHub (or, in token mode, anonymized to aggregate counts).
      </p>
      <p>
        Because username mode needs no login, someone could generate a wrapped
        for your public username before you do. If that happens, sign in with
        GitHub to <strong>claim it as yours</strong> — once claimed, only you can
        regenerate or delete it from{" "}
        <a href="/me" className="underline">
          /me
        </a>
        . Don&apos;t want a page for your username to exist at all? Email us
        (below) and we&apos;ll remove it.
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
        For privacy questions, takedown, or deletion requests outside the in-app
        flow, email{" "}
        <a href="mailto:hiteshm.devlog@gmail.com" className="underline">
          hiteshm.devlog@gmail.com
        </a>{" "}
        or reach{" "}
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
