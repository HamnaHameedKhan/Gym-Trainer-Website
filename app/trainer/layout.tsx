"use client";

import React, { useState } from "react";
import Sidebar from "@/components/trainer/Sidebar";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("Dashboard");
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Logged out successfully!");
      router.push("/Login");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      <Sidebar active={active} setActive={setActive} handleLogout={handleLogout} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
