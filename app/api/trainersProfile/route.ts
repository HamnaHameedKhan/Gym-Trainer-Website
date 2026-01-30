import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {supabase} from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      gender,
      bio,
      specializations,
      plans,
      profileImage,
      certificates,
    } = body;

    // Upload profile image to Cloudinary
    let profileImageUrl: string | null = null;
    if (profileImage) {
      profileImageUrl = await uploadToCloudinary(profileImage);
    }

    // Upload certificates to Cloudinary
    const certificatesUrls = [];
    if (certificates?.length) {
      for (const cert of certificates) {
        const url = await uploadToCloudinary(
          cert.file,
          "GymTrainer website images/trainer_certificates/"
        );
        certificatesUrls.push({ name: cert.name, url });
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("trainer_profiles")
      .insert([
        {
          full_name: fullName,
          gender,
          bio,
          specializations,
          plans,
          profile_image: profileImageUrl,
          certificates: certificatesUrls,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, trainer: data });
  } catch (err) {
    console.error("Trainer API error:", err);
    return NextResponse.json(
      { success: false, message: "fetch failed", error: err },
      { status: 500 }
    );
  }
}
