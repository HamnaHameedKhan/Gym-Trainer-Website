"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  BarChart2,
  Clock,
  MessageCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const sidebarItems = [
  { name: "Dashboard", icon: Dumbbell, path: "/trainee/traineeDashboard" },
  { name: "My Plan", icon: BarChart2, path: "/trainee/my-plan" },
  { name: "Workouts", icon: Clock, path: "/trainee/workouts" },
  { name: "Progress", icon: BarChart2, path: "/trainee/progress" },
  { name: "Chat Trainer", icon: MessageCircle, path: "/trainee/chat" },
  { name: "Settings", icon: Settings, path: "/trainee/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        toast.error("Unable to fetch user");
        return;
      }

      setUser(user);
    };

    getUser();
  }, []);

  // 🔹 Fetch user profile
  useEffect(() => {
    if (!user) return;

    const getProfile = async () => {
      const { data, error } = await supabase
        .from("trainees_profiles")
        .select("full_name, profile_image")
        .eq("user_id", user.id)
        .maybeSingle();

        console.log(data)

      if (error) {
        toast.error("Unable to load profile");
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    getProfile();
  }, [user]);

  // 🔹 Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else router.push("/Login");
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] p-6 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="text-2xl font-bold mb-10 flex items-center gap-2">
        <Dumbbell className="text-[#00ff66]" />
        <span className="text-white">FITTMATCH</span>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all font-medium
                ${
                  isActive
                    ? "bg-[#00ff66] text-black"
                    : "text-white hover:bg-[#1a1a1a]"
                }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-2 px-4 rounded-lg mt-4 text-red-500 hover:bg-[#1a1a1a] font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="mt-auto flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : (
          <>
            <img
              src={profile?.profile_image || "/user-avatar.png"}
              className="w-10 h-10 rounded-full object-cover"
              alt="user"
            />
            <div>
              <p className="font-semibold text-sm text-white">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {"trainee"}
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
