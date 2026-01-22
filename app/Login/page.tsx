"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import login from "@/app/assets/login.png";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch role from users table
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (roleError || !userData?.role) {
      toast.error("Unable to fetch role");
      setLoading(false);
      return;
    }

    // 3️⃣ Redirect based on role
    if (userData.role === "trainee") {
      toast.success("Login successful! Redirecting to Trainee Dashboard...");
      router.push("/TraineeDashboard");
    } else if (userData.role === "trainer") {
      toast.success("Login successful! Redirecting to Trainer Dashboard...");
      router.push("/TrainerDashboard");
    } else {
      toast.error("Role not assigned");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Side Image */}
      <div className="md:w-1/2 hidden md:block">
        <img src={login.src} alt="Fitness" className="w-full h-screen object-cover" />
      </div>

      {/* Right Side Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-left gap-3 mb-6 cursor-pointer">
              <Dumbbell className="text-[#00ff66] w-7 h-7" />
              <span className="text-white font-bold text-2xl">FITTMATCH</span>
            </div>
          </Link>

          <h2 className="text-white text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Enter your credentials to access your personalized training dashboard.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Email Address</label>
              <input
                placeholder="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label className="text-white text-sm mb-1">Password</label>
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white"
                required
              />
              <span
                className="absolute right-3 top-11 -translate-y-1/2 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3 rounded-2xl bg-[#00ff66] text-black font-semibold disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-6 text-center">
            Don't have an account?{" "}
            <Link href="/Signup" className="text-[#00ff66] font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
