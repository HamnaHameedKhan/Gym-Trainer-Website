import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("trainer-id");
     console.log("Trainer ID from header (user_id):", userId);
    if (!userId) {
      return NextResponse.json({ error: "Trainer ID missing" }, { status: 400 });
    }

    // 🔥 STEP 1: get trainer_profile.id from user.id
    const { data: trainerProfile, error: profileError } = await supabase
      .from("trainer_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (profileError || !trainerProfile) {
      return NextResponse.json(
        { error: "Trainer profile not found" },
        { status: 404 }
      );
    }
    const trainerProfileId = trainerProfile.user_id;
    console.log("trainerprfileid",trainerProfileId)

    // 🔥 STEP 2: use trainer_profile.id
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
      .eq("trainer_id", trainerProfileId)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const trainees =
      data?.map((r: any) => ({
        id: r.trainee?.id,
        full_name:
          r.trainee_profile?.full_name || r.trainee?.name || "Unknown",
        profile_image: r.trainee_profile?.profile_image || null,
        active_plan: null,
        start_date: null,
        completion: 0,
        goal: r.trainee_profile?.goal || "",
        height: r.trainee_profile?.height || "",
        weight: r.trainee_profile?.weight || "",
        waist: r.trainee_profile?.waist || "",
        activity_level: r.trainee_profile?.activity_level || "",
        gender: r.trainee_profile?.gender || "",
      })) || [];

      console.log("Raw data from supabase:", data);
    return NextResponse.json({ success: true, trainees });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
