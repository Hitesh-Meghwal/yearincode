import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const meta = user.user_metadata ?? {};
  const githubUsername: string | undefined =
    meta.user_name ?? meta.preferred_username ?? meta.login;
  const avatarUrl: string | undefined = meta.avatar_url;
  const fullName: string | undefined = meta.full_name ?? meta.name;

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
        <SignOutButton />
      </div>
    </main>
  );
}
