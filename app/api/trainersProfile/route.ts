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

     // 2️⃣ Handle certificates
    const certificatesUrls = [];
    if (certificates?.length) {
      for (const cert of certificates) {
        // Check if file is image
        const isImage = cert.file?.startsWith("data:image") || cert.file?.match(/\.(jpg|jpeg|png|gif)$/i);
        
        let url = cert.file; // default: direct file (PDF/other)

        if (isImage) {
          // Upload only if image
          url = await uploadToCloudinary(
            cert.file,
            "GymTrainer website images/trainer_certificates/"
          );
        }

        certificatesUrls.push({ name: cert.name, file: url });
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
