import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("trainer_profiles")
      .select(`
        id,
        user_id,
        full_name,
        bio,
        specializations,
        profile_image,
        plans
      `);

      // console.log("trainer data:",data)

    if (error) throw error;

    return NextResponse.json({ success: true, trainers: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}
