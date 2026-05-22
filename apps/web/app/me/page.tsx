import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import DeleteWrappedButton from "./DeleteWrappedButton";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

export default async function MePage() {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);

  if (!user) {
    redirect("/");
  }

  const meta = user.user_metadata ?? {};
  const githubUsername: string | undefined =
    meta.user_name ?? meta.preferred_username ?? meta.login;
  const avatarUrl: string | undefined = meta.avatar_url;
  const fullName: string | undefined = meta.full_name ?? meta.name;

  // List all wrappeds owned by this user, newest year first.
  const { data: wrappeds } = await supabase
    .from("wrapped_reports")
    .select("id, year, view_count, created_at")
    .eq("user_id", user.id)
    .order("year", { ascending: false });

  const rows = (wrappeds ?? []) as Array<{
    id: string;
    year: number;
    view_count: number | null;
    created_at: string;
  }>;

  return (
    <main className="min-h-screen px-6 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        {/* Identity card */}
        <header className="flex items-center gap-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={githubUsername ?? "avatar"}
              width={72}
              height={72}
              className="rounded-full border border-neutral-800"
            />
          ) : null}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              signed in
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              @{githubUsername ?? "unknown"}
            </h1>
            {fullName ? (
              <p className="text-sm text-neutral-400">{fullName}</p>
            ) : null}
          </div>
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </header>

        {/* Primary CTA — always available */}
        <Link
          href="/generate"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-white text-black px-6 py-3 text-base font-semibold hover:bg-neutral-200 transition-colors"
        >
          {rows.length > 0
            ? "Generate another year →"
            : "Generate your first wrapped →"}
        </Link>

        {/* Wrappeds list */}
        {rows.length > 0 ? (
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              your wrappeds ({rows.length})
            </p>
            <ul className="border-y border-neutral-900 divide-y divide-neutral-900">
              {rows.map((row) => (
                <WrappedRow
                  key={row.id}
                  id={row.id}
                  year={row.year}
                  viewCount={row.view_count ?? 0}
                  createdAt={row.created_at}
                  username={githubUsername ?? ""}
                />
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 text-center">
            <p className="text-sm text-neutral-400">
              No wrappeds yet. Pick a year above to generate your first.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function WrappedRow({
  id,
  year,
  viewCount,
  createdAt,
  username,
}: {
  id: string;
  year: number;
  viewCount: number;
  createdAt: string;
  username: string;
}) {
  const created = new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const sharePath = `/u/${username}/${year}`;

  return (
    <li className="grid grid-cols-[5ch_1fr_auto] items-center gap-5 py-4">
      <span className="font-mono text-lg text-neutral-300 tabular-nums font-semibold">
        {year}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500 font-mono truncate">
          {sharePath}
        </p>
        <p className="text-[11px] text-neutral-600 font-mono mt-0.5">
          {fmt(viewCount)} {viewCount === 1 ? "view" : "views"}
          <span className="text-neutral-800"> · </span>
          created {created}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={sharePath}
          className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-100 hover:bg-neutral-900 transition-colors"
        >
          View
        </Link>
        <DeleteWrappedButton wrappedId={id} wrappedYear={year} />
      </div>
    </li>
  );
}
