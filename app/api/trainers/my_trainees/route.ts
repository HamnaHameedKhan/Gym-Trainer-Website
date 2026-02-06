import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const trainerId = request.headers.get("trainer-id"); // trainer id from frontend/auth
    if (!trainerId) {
      return NextResponse.json({ error: "Trainer ID missing" }, { status: 400 });
    }

    // Fetch accepted requests for this trainer and include trainee profile
    const { data, error } = await supabase
      .from("trainee_requests")
      .select(`
        id,
        status,
        created_at,
        trainee:trainee_requests_trainee_id_fkey (
          id,
          name
        ),
        trainee_profile:trainee_requests_trainee_profiles_fkey (
          full_name,
          profile_image,
          goal,
          height,
          weight,
          waist,
          activity_level,
          gender
        )
      `)
      .eq("trainer_id", trainerId)
      .eq("status", "accepted") // only accepted requests
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map rows safely
    const trainees = data
      ?.filter((r: any) => r.trainee) // only include rows with trainee relation
      .map((r: any) => ({
        id: r.trainee.id,
        full_name: r.trainee.name || r.trainee_profile?.full_name || "Unknown",
        profile_image:
          r.trainee_profile?.profile_image || "/trainer-placeholder.png",
        active_plan: null, // placeholder
        start_date: null, // placeholder
        completion: 0, // placeholder
        goal: r.trainee_profile?.goal || "",
        height: r.trainee_profile?.height || "",
        weight: r.trainee_profile?.weight || "",
        waist: r.trainee_profile?.waist || "",
        activity_level: r.trainee_profile?.activity_level || "",
        gender: r.trainee_profile?.gender || "",
      })) || [];

    return NextResponse.json({ success: true, trainees });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
