import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUserSafe } from "@/lib/supabase/server";
import DeleteWrappedButton from "./DeleteWrappedButton";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

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

  // Look up the user's most recent wrapped — drives both the View/Generate
  // CTA copy and whether to show the Delete button.
  const { data: ownedWrapped } = await supabase
    .from("wrapped_reports")
    .select("id, year")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="uppercase tracking-[0.3em] text-xs text-neutral-400">
          signed in
        </p>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={githubUsername ?? "avatar"}
            width={96}
            height={96}
            className="mx-auto rounded-full border border-neutral-800"
          />
        ) : null}
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight">
            @{githubUsername ?? "unknown"}
          </h1>
          {fullName ? (
            <p className="text-neutral-400">{fullName}</p>
          ) : null}
          {user.email ? (
            <p className="text-neutral-500 text-sm">{user.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 text-base font-semibold hover:bg-neutral-200 transition-colors"
          >
            {ownedWrapped ? "View your wrapped →" : "Generate wrapped →"}
          </Link>
          <SignOutButton />
        </div>

        {ownedWrapped ? (
          <div className="pt-6 mt-6 border-t border-neutral-900 flex flex-col items-center gap-2">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Danger zone
            </p>
            <DeleteWrappedButton
              wrappedId={ownedWrapped.id}
              wrappedYear={ownedWrapped.year}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
