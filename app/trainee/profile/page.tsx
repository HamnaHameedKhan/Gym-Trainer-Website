"use client";

import React, { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    height: "",
    weight: "",
    waist: "",
    activityLevel: "",
    goal: "",
    profileImageFile: null as File | null,
    profileImageBase64: "",
  });

  // ================= IMAGE HELPERS =================
  const compressImage = async (file: File) => {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/Login");
        return;
      }

      setUserId(session.user.id);

      const res = await fetch(`/api/traineeProfile?user_id=${session.user.id}`);
      const data = await res.json();

      if (data.profile) {
        setIsEdit(true);
        setPreview(data.profile.profile_image || null);

        setFormData((prev) => ({
          ...prev,
          fullName: data.profile.full_name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          gender: data.profile.gender || "",
          height: data.profile.height || "",
          weight: data.profile.weight || "",
          waist: data.profile.waist || "",
          activityLevel: data.profile.activity_level || "",
          goal: data.profile.goal || "",
        }));
      }
    };

    loadProfile();
  }, [router]);

  // ================= HANDLERS =================
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleGoalClick = (goal: string) => {
    setFormData((p) => ({ ...p, goal }));
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);

    setFormData((p) => ({
      ...p,
      profileImageFile: compressed,
      profileImageBase64: base64,
    }));

    setPreview(URL.createObjectURL(compressed));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        waist: formData.waist,
        activity_level: formData.activityLevel,
        goal: formData.goal,
        profile_image_base64: formData.profileImageBase64 || null,
      };

      const res = await fetch("/api/traineeProfile", {
        method: "POST", // upsert hai backend me
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(isEdit ? "Profile updated 🎉" : "Profile saved 🎉");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI (UNCHANGED) =================
  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10 flex justify-center">
      <Toaster position="top-right" />

      <div className="w-full max-w-6xl grid md:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="bg-[#1e1e1e] p-6 rounded-lg flex flex-col items-center">
          <img
            src={preview || "/user-avatar.png"}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />

          <h2 className="text-xl font-bold mb-1">{formData.fullName}</h2>
          <p className="text-gray-400 mb-4">Trainee</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#00ff66] text-black px-4 py-2 rounded"
          >
            Change Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">
          {/* PERSONAL INFO */}
          <div className="bg-[#1e1e1e] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Full name
                </label>
                <input
                  className="input"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email{" "}
                </label>
                <input
                  className="input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  className="input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Gender
                </label>

                <select
                  className="input"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="bg-[#1e1e1e] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Body Measurements</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Height
                </label>
                <input
                  className="input"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height (cm)"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Weight
                </label>
                <input
                  className="input"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight (kg)"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Waist
                </label>
                <input
                  className="input"
                  name="waist"
                  value={formData.waist}
                  onChange={handleChange}
                  placeholder="Waist"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Activity Level
              </label>

              <select
                className="input mt-4"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
              >
                <option value="">Activity Level</option>
                <option>Lightly Active (1-3 days/week)</option>
                <option>Moderately Active (3-5 days/week)</option>
                <option>Very Active (6-7 days/week)</option>
              </select>
            </div>
          </div>

          {/* GOAL */}
          <div className="bg-[#1e1e1e] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Primary Goal</h3>

            <div className="flex gap-3 flex-wrap">
              {["WeightLoss", "MuscleGain", "Cardio", "Athletic"].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGoalClick(g)}
                  className={`px-4 py-2 rounded ${
                    formData.goal === g
                      ? "bg-[#00ff66] text-black"
                      : "bg-[#2a2a2a]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            onClick={handleSave}
            className="w-full py-3 bg-[#00ff66] text-black rounded-lg font-semibold"
          >
            {loading ? "Saving..." : isEdit ? "Update Profile" : "Save Profile"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          background: #2a2a2a;
          padding: 10px;
          border-radius: 8px;
          color: white;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
