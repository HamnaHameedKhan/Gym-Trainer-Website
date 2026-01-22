"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Dumbbell,
  BarChart2,
  Clock,
  User,
  MessageCircle,
  LogOut,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TraineeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { name: "Dashboard", icon: <Dumbbell /> },
    { name: "My Plan", icon: <BarChart2 /> },
    { name: "Workouts", icon: <Clock /> },
    { name: "Progress", icon: <BarChart2 /> },
    { name: "Chat Trainer", icon: <MessageCircle /> },
    { name: "Logout", icon: <LogOut />, action: "logout" },
  ];

  // Check session and role
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/Login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role !== "trainee") {
        router.push("/Login");
        return;
      }

      setLoading(false);
    };

    checkUser();

    // Auto logout on session expire
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          router.push("/Login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.success("Logged out successfully!");
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* Toast */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] p-6 flex flex-col">
        <div className="text-2xl font-bold mb-10 flex items-center gap-2">
          <Dumbbell className="text-[#00ff66]" /> FITTMATCH
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action === "logout" ? handleLogout : undefined}
            className="flex items-center gap-3 py-2 px-4 rounded-lg mb-2 hover:bg-[#1a1a1a] transition-colors"
          >
            {item.icon} <span>{item.name}</span>
          </button>
        ))}

        {/* User Info */}
        <div className="mt-auto flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
          <img
            src="/user-avatar.png"
            alt="Trainee"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-sm">Emma Stone</p>
            <p className="text-xs text-gray-400">Trainee</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Greeting */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Good morning, Emma!</h1>
            <p className="text-gray-400">Ready to crush your goals today?</p>
          </div>
          <p className="text-gray-400 text-sm">Wednesday, Oct 30</p>
        </div>

        {/* Current Session */}
        <div className="bg-[#1a1a1a] p-6 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-[#00ff66] mb-2">TODAY'S SESSION</p>
            <h2 className="text-xl font-bold mb-2">Lower Body Strength & Power</h2>
            <p className="text-gray-400 text-sm">60 min · High Intensity · 8 Exercises</p>
            <button className="mt-3 px-4 py-2 bg-[#00ff66] text-black font-semibold rounded-lg">
              Start Workout
            </button>
          </div>
          <div>
            <img
              src="/gym-session.png"
              alt="Workout"
              className="w-48 h-32 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Current Plan + Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Plan */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Current Plan</h3>
              <p className="text-[#00ff66] cursor-pointer">View Plan</p>
            </div>
            <p className="text-gray-400 text-sm">Marathon Prep Phase 2</p>
            <p className="text-gray-400 text-sm">Oct 12, 2024 - Jan 15, 2025 · Week 6</p>
            <div className="w-full bg-gray-700 h-2 rounded-full mt-3">
              <div className="bg-[#00ff66] h-2 rounded-full w-[65%]"></div>
            </div>
            <div className="flex justify-between mt-3 text-gray-400 text-sm">
              <p>Workouts: 24/36</p>
              <p>Active Days: 18</p>
              <p>Streak: 5 Days</p>
            </div>
          </div>

          {/* This Week Stats */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg">
            <h3 className="font-semibold mb-4">This Week</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-400 text-sm">
              <div>
                <p className="font-bold text-white">4/5</p>
                <p>Workouts</p>
              </div>
              <div>
                <p className="font-bold text-white">2.4k</p>
                <p>Calories</p>
              </div>
              <div>
                <p className="font-bold text-white">3.5h</p>
                <p>Active Time</p>
              </div>
              <div>
                <p className="font-bold text-white">-0.5kg</p>
                <p>Weight</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Info + Up Next */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coach */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg flex flex-col items-center">
            <img
              src="/coach-avatar.png"
              alt="Coach"
              className="w-20 h-20 rounded-full mb-3"
            />
            <p className="font-semibold">Marcus J.</p>
            <p className="text-gray-400 text-sm mb-4">Elite Performance Coach</p>
            <button className="px-4 py-2 bg-[#00ff66] text-black rounded-lg w-full mb-2">
              Chat
            </button>
            <button className="px-4 py-2 border border-gray-500 rounded-lg w-full">
              Profile
            </button>
          </div>

          {/* Up Next */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg col-span-2">
            <h3 className="font-semibold mb-4">Up Next</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between bg-[#121212] p-4 rounded-lg">
                <p>01 Active Recovery</p>
                <p className="text-gray-400 text-sm">Mobility & Stretch</p>
              </div>
              <div className="flex justify-between bg-[#121212] p-4 rounded-lg">
                <p>03 Long Run</p>
                <p className="text-gray-400 text-sm">Endurance · 10km</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
