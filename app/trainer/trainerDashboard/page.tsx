"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";


const TrainerDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<any>(null);
  const [active, setActive] = useState("Dashboard");

  // ====================== FETCH TRAINER PROFILE ======================
  useEffect(() => {
    const fetchTrainer = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/Login");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userError || userData?.role !== "trainer") {
        router.push("/Login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(profileError);
        toast.error("Error loading profile");
      }

      setTrainer(profileData || { full_name: "Trainer", profile_image: null });
      setLoading(false);
    };

    fetchTrainer();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/Login");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.success("Logged out successfully!");
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Welcome, <span>{trainer?.full_name || "Trainer"}</span>
          </h2>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6" />
            <div className="flex items-center">
              {trainer?.profile_image ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={trainer.profile_image}
                    alt="Trainer"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= STATS CARDS ================= */}
        <section className="grid grid-cols-4 gap-6">
          <div className="bg-[#0e0e0e] p-4 rounded">
            <p className="text-gray-400 text-sm">Active Trainees</p>
            <h3 className="text-2xl font-bold">42</h3>
            <p className="text-green-500 text-sm">+12% from last month</p>
          </div>
          <div className="bg-[#0e0e0e] p-4 rounded">
            <p className="text-gray-400 text-sm">Pending Requests</p>
            <h3 className="text-2xl font-bold">8</h3>
            <p className="text-gray-400 text-sm">3 new today</p>
          </div>
          <div className="bg-[#0e0e0e] p-4 rounded">
            <p className="text-gray-400 text-sm">Active Plans</p>
            <h3 className="text-2xl font-bold">35</h3>
            <p className="text-green-500 text-sm">+5% from last week</p>
          </div>
          <div className="bg-[#0e0e0e] p-4 rounded">
            <p className="text-gray-400 text-sm">Unread Messages</p>
            <h3 className="text-2xl font-bold">12</h3>
            <p className="text-red-500 text-sm">Action required</p>
          </div>
        </section>

        {/* ================= Recent Requests & Activity Feed ================= */}
        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#0e0e0e] p-4 rounded space-y-4">
            <h3 className="font-bold text-lg mb-4">Recent Hire Requests</h3>
            <p className="text-gray-400">No new requests yet.</p>
          </div>

          <div className="bg-[#0e0e0e] p-4 rounded">
            <h3 className="font-bold text-lg mb-4">Activity Feed</h3>
            <p className="text-gray-400">No recent activity.</p>
          </div>
        </section>
      </main>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default TrainerDashboard;
