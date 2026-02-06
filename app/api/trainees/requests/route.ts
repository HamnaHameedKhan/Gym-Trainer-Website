import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { trainer_profile_id } = await req.json();

    if (!trainer_profile_id) {
      return NextResponse.json(
        { success: false, message: "Trainer profile id required" },
        { status: 400 }
      );
    }

    // 1️⃣ Auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // 2️⃣ Supabase server client with token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 3️⃣ Logged-in user (trainee)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4️⃣ Trainee from users table
    const { data: trainee } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .eq("role", "trainee")
      .single();

    if (!trainee) {
      return NextResponse.json(
        { success: false, message: "Trainee not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Trainer profile → user_id
    const { data: trainerProfile } = await supabase
      .from("trainer_profiles")
      .select("user_id")
      .eq("id", trainer_profile_id)
      .single();

    if (!trainerProfile) {
      return NextResponse.json(
        { success: false, message: "Trainer profile not found" },
        { status: 404 }
      );
    }

    const trainer_user_id = trainerProfile.user_id;

    // 6️⃣ Check duplicate request
    const { data: existing } = await supabase
      .from("trainee_requests")
      .select("id")
      .eq("trainee_id", trainee.id)
      .eq("trainer_id", trainer_user_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Request already sent" },
        { status: 409 }
      );
    }

    // 7️⃣ Insert request
    const { data, error } = await supabase
      .from("trainee_requests")
      .insert([
        {
          trainee_id: trainee.id,
          trainer_id: trainer_user_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
