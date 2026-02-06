import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const trainer_profile_id = url.searchParams.get("trainer_profile_id");
    if (!trainer_profile_id)
      return NextResponse.json(
        { success: false, message: "Trainer ID missing" },
        { status: 400 }
      );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Get logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    // Get trainer_user_id from profile
    const { data: trainerProfile } = await supabase
      .from("trainer_profiles")
      .select("user_id")
      .eq("id", trainer_profile_id)
      .single();

    if (!trainerProfile)
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );

    // Check if trainee_request exists
    const { data: existing } = await supabase
      .from("trainee_requests")
      .select("id")
      .eq("trainee_id", user.id)
      .eq("trainer_id", trainerProfile.user_id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      exists: !!existing, // ✅ true if request exists
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to check request status" },
      { status: 500 }
    );
  }
}
