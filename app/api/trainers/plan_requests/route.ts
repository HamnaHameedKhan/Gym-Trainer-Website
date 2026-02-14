import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/* ----------------------------------------
   POST → Trainee selects a plan
-----------------------------------------*/
export async function POST(req: Request) {
  const body = await req.json();

  const {
    trainee_id,
    trainer_profile_id, // must send this
    plan_category,
    price,
    duration_months,
  } = body;

  console.log(trainer_profile_id)
  if (!trainee_id || !trainer_profile_id || !plan_category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // 1️⃣ Get trainer user_id from trainer_profiles
  const { data: trainerProfile, error: trainerError } = await supabase
    .from("trainer_profiles")
    .select("user_id")
    .eq("id", trainer_profile_id)
    .single();

  if (trainerError || !trainerProfile) {
    return NextResponse.json(
      { error: "Trainer profile not found" },
      { status: 404 }
    );
  }

  const trainer_user_id = trainerProfile.user_id;

  // 2️⃣ Insert plan request
  const { error } = await supabase.from("plan_requests").insert([
    {
      trainee_id,
      trainer_id: trainer_user_id, // FK expects user_id
      plan_category,
      price,
      duration_months,
      start_date: new Date(),
      expiry_date: new Date(
        new Date().setMonth(new Date().getMonth() + duration_months)
      ),
      status: "pending",
    },
  ]);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Plan request sent successfully",
  });
}


/* ----------------------------------------
   GET → Get plan status for trainee
-----------------------------------------*/
/* ----------------------------------------
   GET → Trainer sees his plan requests
-----------------------------------------*/
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trainer_profile_id = searchParams.get("trainer_profile_id");

  const trainee_id = searchParams.get("trainee_id");
  console.log("paramsa",trainer_profile_id)

  if (!trainer_profile_id) {
    return NextResponse.json(
      { error: "Missing required params" },
      { status: 400 }
    );
  }

  // 1️⃣ Get trainer user_id from trainer_profiles
  const { data: trainerProfile, error: trainerError } = await supabase
    .from("trainer_profiles")
    .select("user_id")
    .eq("id", trainer_profile_id)
    .single();

  if (trainerError || !trainerProfile) {
    return NextResponse.json(
      { error: "Trainer profile not found" },
      { status: 404 }
    );
  }

  const trainer_user_id = trainerProfile.user_id;
  console.log("user:",trainer_user_id)

  // 2️⃣ Fetch plan requests using SAME user_id
  const { data, error } = await supabase
    .from("plan_requests")
    .select(`
      id,
      plan_category,
      price,
      duration_months,
      start_date,
      expiry_date,
      status,
      trainee_id,
      users:trainees_profiles!plan_requests_trainee_id_fkey
      (id, full_name, email)
    `)
    .eq("trainer_id", trainer_user_id)
    .eq("trainee_id", trainee_id)
    .order("created_at", { ascending: false });

    console.log(data)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}
