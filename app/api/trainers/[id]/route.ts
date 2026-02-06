// app/api/trainers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest, context: any) {
  // 🔑 Unwrap params because it's a Promise
  const params = await context.params;
  const id = params?.id;

  console.log("PARAMS ID in API:", id);

  if (!id) {
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trainer_profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message || "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, trainer: data });
}
