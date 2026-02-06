"use client";

import {
  FileText,
  User,
  CheckSquare,
  Users,
  BookOpen,
  MessageCircle,
  Dumbbell,
  LogOut,
} from "lucide-react";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";



interface SidebarProps {
  active: string;
  setActive: (name: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, setActive, handleLogout }) => {
  const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: FileText, path: "/trainer/trainerDashboard" },
    { name: "Profile", icon: User, path: "/trainer/profile" },
    { name: "Requests", icon: CheckSquare,  path: "/trainer/trainee_requests" },
    { name: "Trainees", icon: Users,path: "/trainer/my_trainees" },
    { name: "Plans", icon: FileText },
    { name: "Logout", icon: LogOut }, // Logout as top menu item
  ];

  const toolItems = [
    { name: "Exercise Library", icon: BookOpen },
    { name: "Assign Workouts", icon: CheckSquare },
    { name: "Chat", icon: MessageCircle },
  ];


  
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
          .from("trainer_profiles")
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

  return (
    <aside className="w-64 bg-[#0a0a0a] flex flex-col min-h-screen p-6">
      {/* Top section: Logo + Menu + Tools */}
      <div className="flex flex-col gap-6 overflow-y-auto">
        {/* Logo */}
        <h1 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Dumbbell className="text-[#00ff66]" />
          <span className="text-white">FITTMATCH</span>
        </h1>

        {/* Menu */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <a
              key={item.name}
              onClick={() => {
                setActive(item.name);
                if (item.name === "Logout") {
                  handleLogout(); // Logout function for Logout menu item
                } else if (item.path) {
                  router.push(item.path); // Navigate for other items
                }
              }}
              className={`px-4 py-2 rounded flex items-center gap-2 cursor-pointer ${
                item.name === "Logout"
                  ? "text-red-500 hover:bg-[#00ff66]" // red color for logout
                  : active === item.name
                  ? "bg-[#00ff66] text-black"
                  : "hover:bg-[#00000014] text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </a>
          ))}
        </nav>

        {/* Tools */}
        <h2 className="mt-6 text-gray-400 uppercase text-sm mb-2">Tools</h2>
        <nav className="flex flex-col gap-3">
          {toolItems.map((item) => (
            <a
              key={item.name}
              className="hover:bg-[#00000014] px-4 py-2 rounded flex items-center gap-2 text-white cursor-pointer"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>


       {/* User Info */}
      <div className="mt-5 flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
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
                {"trainer"}
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
