import { NextResponse } from "next/server";
import { createClient, getUserSafe } from "@/lib/supabase/server";

export const runtime = "nodejs";

// DELETE /api/wrapped/[id] — per PRD §7.4. Auth required; RLS already
// enforces ownership (the "Users can manage their own wrappeds" policy), so
// the .delete().eq("id", id) here can only affect rows the user owns.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { error, count } = await supabase
    .from("wrapped_reports")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[api/wrapped/[id]] delete failed", error);
    return NextResponse.json(
      { error: "delete_failed", message: error.message },
      { status: 500 },
    );
  }

  if (!count) {
    // RLS hid the row (not owned by this user) or the id doesn't exist.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
