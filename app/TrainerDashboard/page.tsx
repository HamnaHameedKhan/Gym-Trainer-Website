"use client";
import {
  Bell,
  MessageCircle,
  Users,
  FileText,
  BookOpen,
  CheckSquare,
  Settings,
  Dumbbell,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const TrainerDashboard = () => {
  const recentRequests = [
    {
      name: "Sarah Miller",
      goal: "Weight Loss",
      frequency: "3 days/week",
      avatar: "/avatars/avatar1.jpg",
    },
    {
      name: "David Chen",
      goal: "Muscle Gain",
      frequency: "5 days/week",
      avatar: "/avatars/avatar2.jpg",
    },
    {
      name: "Maria Rodriguez",
      goal: "Endurance",
      frequency: "4 days/week",
      avatar: "/avatars/avatar3.jpg",
    },
  ];

  const activityFeed = [
    {
      text: "James completed 'Leg Day Destruction'",
      time: "25 mins ago",
      color: "green",
    },
    {
      text: "New message from Emily: 'My shoulder hurts...'",
      time: "1 hour ago",
      color: "blue",
    },
    {
      text: "Michael renewed subscription",
      time: "3 hours ago",
      color: "yellow",
    },
    {
      text: "Sarah missed 2 workouts this week",
      time: "Yesterday",
      color: "red",
    },
  ];

  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

      if (userData?.role !== "trainer") {
        router.push("/Login");
        return;
      }

      setLoading(false);
    };

    checkUser();

    // Auto logout on session expire
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/Login");
      }
    });

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
    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#00ff66] flex items-center gap-2 mb-10">
            <Dumbbell className="text-[#00ff66]" /> FITTMATCH
          </h1>

          <nav className="flex flex-col gap-3">
            <a className="bg-[#00ff66] text-black px-4 py-2 rounded flex items-center gap-2">
              <FileText className="w-5 h-5" /> Dashboard
            </a>
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <CheckSquare className="w-5 h-5" /> Requests
            </a>
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <Users className="w-5 h-5" /> Trainees
            </a>
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <FileText className="w-5 h-5" /> Plans
            </a>
          </nav>

          <h2 className="mt-10 text-gray-400 uppercase text-sm mb-2">Tools</h2>
          <nav className="flex flex-col gap-3">
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Exercise Library
            </a>
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <CheckSquare className="w-5 h-5" /> Assign Workouts
            </a>
            <a className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Chat
            </a>
          </nav>
        </div>

        <a
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="hover:bg-[#00ff66] px-4 py-2 rounded flex items-center gap-2 hover:text-black"
        >
          <LogOut className="w-5 h-5" /> Logout
        </a>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Trainer Dashboard</h2>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6" />
            <div className="flex items-center gap-2">
              <Image
                src="/avatars/marcus.jpg"
                alt="Marcus Johnson"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span>Marcus Johnson</span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
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
        </div>

        {/* Recent Hire Requests & Activity Feed */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#0e0e0e] p-4 rounded space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Hire Requests</h3>
              <a className="text-[#00ff66] text-sm cursor-pointer">
                View All Requests
              </a>
            </div>

            {recentRequests.map((req, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-[#121212] p-3 rounded"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={req.avatar}
                    alt={req.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{req.name}</p>
                    <p className="text-gray-400 text-sm">
                      Looking for: {req.goal} - {req.frequency}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border border-gray-600">
                    Decline
                  </button>
                  <button className="px-3 py-1 rounded bg-[#00ff66] text-black">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0e0e0e] p-4 rounded">
            <h3 className="font-bold text-lg mb-4">Activity Feed</h3>
            <ul className="space-y-3">
              {activityFeed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className={`w-2 h-2 mt-1 rounded-full bg-${item.color}-500`}
                  ></span>
                  <div>
                    <p>{item.text}</p>
                    <p className="text-gray-400 text-xs">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;
