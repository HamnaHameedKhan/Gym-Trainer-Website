import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ================= CREATE / UPDATE PROFILE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      full_name,
      email,
      phone,
      gender,
      height,
      weight,
      waist,
      activity_level,
      goal,
      profile_image_base64,
    } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "User not logged in" },
        { status: 401 }
      );
    }

    // upload image
    let profile_image: string | null = null;
    if (profile_image_base64) {
      profile_image = await uploadToCloudinary(
        profile_image_base64,
        "trainee-profile"
      );
    }

    // UPSERT (create + update both)
    const { data, error } = await supabase
      .from("trainees_profiles")
      .upsert(
        {
          user_id,
          full_name,
          email,
          phone,
          gender,
          height,
          weight,
          waist,
          activity_level,
          goal,
          ...(profile_image && { profile_image }),
          updated_at: new Date(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle(); 

    if (error) throw error;

    return NextResponse.json({ profile: data }, { status: 200 });
  } catch (error: any) {
    console.error("Trainee Profile Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ================= GET PROFILE =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("trainees_profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle(); 

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
