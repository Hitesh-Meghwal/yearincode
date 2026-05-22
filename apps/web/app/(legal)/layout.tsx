import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-10"
        >
          ← yearincode
        </Link>
        <article className="prose-invert space-y-4 text-neutral-200 leading-relaxed">
          {children}
        </article>
      </div>
    </div>
  );
}
