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
import { useRouter } from "next/navigation";

interface SidebarProps {
  active: string;
  setActive: (name: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, setActive, handleLogout }) => {
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: FileText, path: "/trainer/trainerDashboard" },
    { name: "Profile", icon: User, path: "/trainer/profile" },
    { name: "Requests", icon: CheckSquare },
    { name: "Trainees", icon: Users },
    { name: "Plans", icon: FileText },
    { name: "Logout", icon: LogOut }, // Logout as top menu item
  ];

  const toolItems = [
    { name: "Exercise Library", icon: BookOpen },
    { name: "Assign Workouts", icon: CheckSquare },
    { name: "Chat", icon: MessageCircle },
  ];

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
    </aside>
  );
};

export default Sidebar;
