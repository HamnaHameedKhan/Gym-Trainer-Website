"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Camera,
  BadgeCheck,
  Dumbbell,
  CreditCard,
  Plus,
  X,
  Eye,
  Coins,
  CoinsIcon,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SpecializationKey =
  | "bodybuilding"
  | "crossfit"
  | "yoga"
  | "PPT"
  | "diet"
  | "cardio";

type PlanKey = "bronze" | "silver" | "gold";

interface Certificate {
  name: string;
  file?: File; // for new uploads
  url?: string; // for existing certificates
}

export default function TrainerProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    bio: "",
    specializations: {} as Record<SpecializationKey, string>,
    profileImage: null as File | null,
    certificates: [] as Certificate[],
    plans: {} as Record<PlanKey, { price: string; duration: string }>,
  });

  const specializations: SpecializationKey[] = [
    "bodybuilding",
    "crossfit",
    "yoga",
    "PPT",
    "diet",
    "cardio",
  ];

  const plans: PlanKey[] = ["bronze", "silver", "gold"];
  const planIcons = {
  bronze: <CoinsIcon size={16} className="text-amber-500" />, // bronze color
  silver: <CoinsIcon size={16} className="text-gray-300" />,  // silver color
  gold: <CoinsIcon size={16} className="text-yellow-400" />,  // gold color
};
  const certificateInputRef = useRef<HTMLInputElement | null>(null);

  // ====================== IMAGE COMPRESSION ======================
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

  // ====================== FETCH EXISTING PROFILE ======================
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return router.push("/Login");

      const { data, error } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
        return;
      }

      if (data) {
        setIsEdit(true);
        setProfileId(data.id);
        setForm({
          fullName: data.full_name || "",
          gender: data.gender || "",
          bio: data.bio || "",
          specializations: data.specializations || {},
          profileImage: null,
          certificates: (data.certificates || []).map((c: any) => ({
            name: c.name,
            url: c.file,
          })),
          plans: data.plans || {},
        });
        setPreview(data.profile_image || null);
      }
    };
    loadProfile();
  }, [router]);

  // ====================== SUBMIT ======================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not logged in");

      // Filter empty specializations and plans
      const filteredSpecializations = Object.fromEntries(
        Object.entries(form.specializations).filter(([_, v]) => v)
      );
      const filteredPlans = Object.fromEntries(
        Object.entries(form.plans).filter(([_, v]) => v.price)
      );

      // Convert new image and certificates to base64
      const profileImageBase64 = form.profileImage
        ? await fileToBase64(form.profileImage)
        : preview;

      const certificatesPayload = await Promise.all(
        form.certificates.map(async (c) => {
          if (c.file) {
            return { name: c.name, file: await fileToBase64(c.file) };
          } else {
            return { name: c.name, file: c.url }; // keep existing
          }
        })
      );

      const payload = {
        full_name: form.fullName,
        gender: form.gender,
        bio: form.bio,
        specializations: filteredSpecializations,
        plans: filteredPlans,
        profile_image: profileImageBase64,
        certificates: certificatesPayload,
        user_id: session.user.id,
      };

      let res;
      if (isEdit) {
        res = await supabase
          .from("trainer_profiles")
          .update(payload)
          .eq("user_id", session.user.id);
      } else {
        res = await supabase.from("trainer_profiles").insert(payload);
        const { error: updateError } = await supabase
          .from("users")
          .update({profile_completed: true })
          .eq("id", session.user.id);

            if (updateError) throw updateError;
      }

      if (res.error) throw res.error;
    


      toast.success("Profile saved successfully 🎉");
      router.push("/trainer/trainerDashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-10">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">
          {isEdit ? "Update Your Profile" : "Complete Your Trainer Profile"}
        </h1>
        <p className="text-center text-gray-400">
          Help trainees find you by showcasing your expertise
        </p>

        {/* ================= BASIC INFO ================= */}
        <div className="card">
          <Header icon={<User />} title="Basic Information" />

          <div className="flex justify-center mb-6">
            <label className="relative w-28 h-28 rounded-full border border-[#00ff66]/40 overflow-hidden cursor-pointer">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="text-[#00ff66]" />
                </div>
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const compressed = await compressImage(file);
                  setForm({ ...form, profileImage: compressed });
                  setPreview(URL.createObjectURL(compressed));
                }}
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <select
              className="input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <textarea
            className="input mt-4"
            rows={4}
            placeholder="Professional Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* ================= EXPERIENCE ================= */}
        <div className="card">
          <Header icon={<BadgeCheck />} title="Experience" />

          <div className="grid md:grid-cols-3 gap-4">
            {specializations.map((s) => (
              <div
                key={s}
                className="bg-[#0e0e0e] border border-white/10 rounded-lg p-4"
              >
                <label className="text-gray-400 capitalize">{s}</label>
                <input
                  className="input mt-2"
                  placeholder="Years of Experience"
                  value={form.specializations[s] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      specializations: {
                        ...form.specializations,
                        [s]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* ================= CERTIFICATES ================= */}
        <div className="card">
          <Header icon={<Plus />} title="Certificates" />

          {form.certificates.map((c, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-3 mb-3 items-center">
              <input
                className="input flex-1"
                placeholder="Certificate Name"
                value={c.name}
                onChange={(e) => {
                  const copy = [...form.certificates];
                  copy[i].name = e.target.value;
                  setForm({ ...form, certificates: copy });
                }}
              />

              {(c.url || c.file) && (
                <button
                  onClick={() =>
                    window.open(c.url || URL.createObjectURL(c.file!), "_blank")
                  }
                >
                  <Eye className="text-[#00ff66]" />
                </button>
              )}

              <button
                onClick={() => {
                  const copy = [...form.certificates];
                  copy.splice(i, 1);
                  setForm({ ...form, certificates: copy });
                }}
              >
                <X className="text-red-500" />
              </button>
            </div>
          ))}

          <input
            ref={certificateInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={async (e) => {
              if (!e.target.files) return;

              const files = Array.from(e.target.files);
              const processed = await Promise.all(
                files.map(async (file) => {
                  if (file.type.startsWith("image/")) {
                    return { file: await compressImage(file), name: "" };
                  }
                  return { file, name: "" };
                })
              );

              setForm({
                ...form,
                certificates: [...form.certificates, ...processed],
              });
              if (certificateInputRef.current) certificateInputRef.current.value = "";
            }}
          />
        </div>

        {/* ================= PLANS ================= */}
        <div className="card">
          <Header icon={<CreditCard />} title="Pricing Plans" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan}
                className="border border-white/10 rounded-xl p-5 bg-[#0a0a0a]"
              >
                <h3 className="flex items-center justify-center gap-2 capitalize mb-4 text-lg font-semibold text-[#00ff66]">
                 
                  {planIcons[plan]} {plan}
                  {/* {plan} */}
                </h3>

                <input
                  className="input mb-3"
                  placeholder="Price ($)"
                  value={form.plans[plan]?.price || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plans: {
                        ...form.plans,
                        [plan]: {
                          price: e.target.value,
                          duration: form.plans[plan]?.duration || "1",
                        },
                      },
                    })
                  }
                />

                <select
                  className="input"
                  value={form.plans[plan]?.duration || "1"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plans: {
                        ...form.plans,
                        [plan]: {
                          duration: e.target.value,
                          price: form.plans[plan]?.price || "",
                        },
                      },
                    })
                  }
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-3 bg-[#00ff66] text-black rounded-lg font-semibold"
        >
          {loading ? "Saving..." : isEdit ? "Update Profile" : "Save & Continue"}
        </button>
      </div>

      <style jsx>{`
        .card {
          background: #0e0e0e;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 10px;
          width: 100%;
          color: white;
        }
      `}</style>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[#00ff66] mb-4 font-semibold text-lg">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}
