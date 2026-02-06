"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface TraineeProfile {
  full_name: string;
  profile_image?: string;
  activity_level?: string;
  goal?: string;
  current_plan?: string;
  workouts_done?: number;
  workouts_total?: number;
  streak?: number;
  active_days?: number;
}

export default function TraineeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TraineeProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        // If not logged in, redirect to login
        router.push("/Login");
        return;
      }

      // Fetch trainee profile
      const { data, error } = await supabase
        .from("trainees_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (!data) {
        // If profile not found, redirect to profile setup
        router.push("/trainee/profile");
        return;
      }

      setProfile({
        full_name: data.full_name,
        profile_image: data.profile_image,
        activity_level: data.activity_level,
        goal: data.goal,
        current_plan: "Marathon Prep Phase 2", // You can fetch from DB if stored
        workouts_done: 24,
        workouts_total: 36,
        streak: 5,
        active_days: 18,
      });

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="flex-1 p-6 overflow-y-auto text-black">
      {/* Greeting */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {profile?.full_name} 👋
          </h1>
          <p className="text-gray-400">Ready to crush your goals?</p>
        </div>
        <p className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Today Session */}
      <div className="bg-[#1a1a1a] p-6 rounded-lg mb-6 flex justify-between">
        <div>
          <p className="text-[#00ff66] text-sm mb-2">TODAY'S SESSION</p>
          <h2 className="text-xl font-bold mb-1">
            Lower Body Strength & Power
          </h2>
          <p className="text-gray-400 text-sm">
            60 min · High Intensity · 8 Exercises
          </p>
          <button className="mt-4 bg-[#00ff66] text-black px-4 py-2 rounded-lg font-semibold">
            Start Workout
          </button>
        </div>
        <img
          src="/gym-session.png"
          className="w-44 h-28 rounded-lg object-cover"
        />
      </div>

      {/* Plan + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Plan */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg col-span-2">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Current Plan</h3>
            <span className="text-[#00ff66] cursor-pointer">View</span>
          </div>
          <p className="text-gray-400 text-sm">{profile?.current_plan}</p>

          <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
            <div
              className="bg-[#00ff66] h-2 rounded-full"
              style={{
                width: `${
                  profile
                    ? (profile.workouts_done! / profile.workouts_total!) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex justify-between text-gray-400 text-sm mt-3">
            <p>
              Workouts: {profile?.workouts_done}/{profile?.workouts_total}
            </p>
            <p>Streak: {profile?.streak} Days</p>
            <p>Active Days: {profile?.active_days}</p>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <h3 className="font-semibold mb-4">This Week</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Workouts" value="4/5" />
            <Stat label="Calories" value="2.4k" />
            <Stat label="Active Time" value="3.5h" />
            <Stat label="Weight" value="-0.5kg" />
          </div>
        </div>
      </div>

      {/* Trainer + Next */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trainer */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center">
          <img
            src="/coach-avatar.png"
            className="w-20 h-20 rounded-full mx-auto mb-3"
          />
          <p className="font-semibold">Marcus J.</p>
          <p className="text-gray-400 text-sm mb-4">
            Elite Performance Coach
          </p>
          <button className="w-full bg-[#00ff66] text-black py-2 rounded-lg mb-2">
            Chat
          </button>
          <button className="w-full border border-gray-500 py-2 rounded-lg">
            Profile
          </button>
        </div>

        {/* Up Next */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg col-span-2">
          <h3 className="font-semibold mb-4">Up Next</h3>
          <div className="space-y-3">
            <NextItem title="Active Recovery" desc="Mobility & Stretch" />
            <NextItem title="Long Run" desc="Endurance · 10km" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* Small reusable parts */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-bold text-white">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}

function NextItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex justify-between bg-[#121212] p-4 rounded-lg">
      <p>{title}</p>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
