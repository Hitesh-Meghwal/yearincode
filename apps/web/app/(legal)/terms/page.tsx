import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service — yearincode",
  description: "Terms for using yearincode.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
      <p className="text-sm text-neutral-500">Last updated 2026-05-23.</p>

      <h2 className="text-xl font-semibold mt-8">Using yearincode</h2>
      <p>
        yearincode is a free service that generates a shareable recap of your
        GitHub activity. By signing in you agree to these terms. If you
        don&apos;t agree, don&apos;t sign in.
      </p>

      <h2 className="text-xl font-semibold mt-8">Your account</h2>
      <p>
        You sign in via GitHub OAuth. You&apos;re responsible for keeping that
        GitHub account secure. Revoke our access any time at
        <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="underline"> github.com/settings/applications</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8">Your content</h2>
      <p>
        The wrapped page generated for you contains your derived stats and
        your GitHub avatar. You grant yearincode the right to display this
        publicly at the share URL while you keep the wrapped active.
        Deleting your wrapped from <a href="/me" className="underline">/me</a> revokes that right.
      </p>

      <h2 className="text-xl font-semibold mt-8">Acceptable use</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Don&apos;t abuse the GitHub API quotas by spam-regenerating.</li>
        <li>Don&apos;t use yearincode to scrape, deanonymize, or harass other developers.</li>
        <li>Don&apos;t attempt to access wrappeds that aren&apos;t yours via guessing or enumeration.</li>
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
