import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { request_id } = await req.json();
  if (!request_id) return NextResponse.json({ error: "Missing request id" }, { status: 400 });

  const { data, error } = await supabase
    .from("trainee_requests")
    .update({ status: "rejected" })
    .eq("id", request_id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, request: data });
}


