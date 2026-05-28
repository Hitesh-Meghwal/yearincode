import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service — yearincode",
  description: "Terms for using yearincode.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
      <p className="text-sm text-neutral-500">Last updated 2026-05-24.</p>

      <h2 className="text-xl font-semibold mt-8">Using yearincode</h2>
      <p>
        yearincode is a free service that generates a shareable recap of GitHub
        activity. You can use it three ways: by typing a public username (no
        login), by signing in with GitHub, or by pasting your own personal
        access token. By using the service you agree to these terms.
      </p>

      <h2 className="text-xl font-semibold mt-8">Public data &amp; usernames</h2>
      <p>
        Username mode builds a wrapped from data that is already public on
        GitHub — the same information visible on a person&apos;s public profile.
        You may generate a wrapped for any public username, but you may{" "}
        <strong>not</strong> use the service to harass, impersonate, or
        misrepresent another person. If a wrapped exists for your username and
        you want it claimed or removed, see the{" "}
        <a href="/privacy" className="underline">privacy policy</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8">Your account &amp; tokens</h2>
      <p>
        If you sign in via GitHub OAuth, you&apos;re responsible for keeping that
        account secure, and you can revoke our access any time at{" "}
        <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="underline">github.com/settings/applications</a>.
        If you paste a personal access token, you&apos;re responsible for the
        scopes you grant it; we use it once and never store it.
      </p>

      <h2 className="text-xl font-semibold mt-8">Your content</h2>
      <p>
        A wrapped page contains derived stats and a GitHub avatar. By generating
        one you grant yearincode the right to display it publicly at the share
        URL while it stays active. A signed-in owner can delete their wrapped
        from <a href="/me" className="underline">/me</a>; that revokes the right.
      </p>

      <h2 className="text-xl font-semibold mt-8">Acceptable use</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Don&apos;t abuse the GitHub API quotas by spam-generating (we rate-limit the no-login path).</li>
        <li>Don&apos;t use yearincode to scrape, deanonymize, impersonate, or harass other developers.</li>
        <li>Don&apos;t attempt to access private data through tokens that aren&apos;t yours.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">No warranty</h2>
      <p>
        yearincode is provided as-is, with no warranty of fitness for any
        purpose. Numbers shown are best-effort approximations from GitHub
        data; we don&apos;t guarantee accuracy. We may rate-limit, suspend, or
        shut down the service at any time.
      </p>

      <h2 className="text-xl font-semibold mt-8">Liability</h2>
      <p>
        To the extent permitted by law, yearincode and its authors aren&apos;t
        liable for any indirect, incidental, or consequential damages arising
        from your use of the service.
      </p>

      <h2 className="text-xl font-semibold mt-8">Changes</h2>
      <p>
        We may update these terms. Material changes will be announced on the
        landing page. Continued use after changes means you accept them.
      </p>

      <h2 className="text-xl font-semibold mt-8">Privacy</h2>
      <p>
        How we handle your data is covered in our
        <a href="/privacy" className="underline"> privacy policy</a>.
      </p>
    </>
  );
}
