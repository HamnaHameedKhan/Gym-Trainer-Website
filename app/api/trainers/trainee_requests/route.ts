// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// export async function GET(req: NextRequest) {
//   try {
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader)
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );

//     const token = authHeader.replace("Bearer ", "");

//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       { global: { headers: { Authorization: `Bearer ${token}` } } }
//     );

//     // Logged-in user (trainer)
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError || !user)
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );

//     // Fetch requests where trainer_id = logged-in user id
// const { data: requests, error } = await supabase
//   .from("trainee_requests")
//   .select(`
//     id,
//     created_at,

//     trainee:users!trainee_requests_trainee_id_fkey (
//       id,
//       name
//     ),

//     trainee_profile:trainees_profiles!trainee_requests_trainee_profiles_fkey (
//       full_name,
//       profile_image,
//       goal,
//       height,
//       weight,
//       waist,
//       activity_level,
//       gender
//     )
//   `)
//   .eq("trainer_id", user.id)
//   .order("created_at", { ascending: false });


//     if (error) throw error;

//     return NextResponse.json({ success: true, requests });
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, message: err.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization check
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

    // 2️⃣ Get logged-in user (trainer)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    // 3️⃣ Fetch all requests for this trainer, including trainee profile
    // Include `status` to differentiate pending / accepted / rejected
    const { data: requests, error } = await supabase
      .from("trainee_requests")
      .select(`
        id,
        status,
        created_at,

        trainee:users!trainee_requests_trainee_id_fkey (
          id,
          name
        ),

        trainee_profile:trainees_profiles!trainee_requests_trainee_profiles_fkey (
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
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 4️⃣ Return requests including their current status
    // The status will be one of: pending, accepted, rejected
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

