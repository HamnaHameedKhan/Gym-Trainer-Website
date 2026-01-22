"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Check, User, Badge, Eye, EyeOff } from "lucide-react";
import signup from "@/app/assets/signup.png";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"trainee" | "trainer" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedRole) return toast.error("Please select a role");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);

    // 1️⃣ Sign up user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError) {
      setLoading(false);
      return toast.error(signUpError.message);
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      return toast.error("User ID not found");
    }

    // 2️⃣ Insert into custom users table
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        name: formData.fullName,
        email: formData.email,
        role: selectedRole,
      },
    ]);

    if (insertError) {
      setLoading(false);
      return toast.error(insertError.message);
    }

    setLoading(false);
    toast.success("Account created successfully!");
    router.push("/Login");
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff66]";

  return (
    <>
      {/* Toaster Component */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="min-h-screen flex flex-col md:flex-row bg-black">
        <div className="md:w-1/2 hidden md:flex">
          <img src={signup.src} alt="Fitness" className="w-full h-screen object-cover" />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link href="/">
              <div className="flex items-center gap-3 mb-6 cursor-pointer">
                <Dumbbell className="text-[#00ff66] w-7 h-7" />
                <span className="text-white font-bold text-2xl">FITTMATCH</span>
              </div>
            </Link>

            <h2 className="text-white text-3xl font-bold mb-2">Create an Account</h2>
            <p className="text-gray-400 mb-6 text-sm">Sign up and start your fitness journey.</p>

            {/* Role Selection */}
            <div className="flex gap-4 mb-6">
              <div
                onClick={() => setSelectedRole("trainee")}
                className={`relative w-1/2 cursor-pointer p-4 rounded-xl border ${
                  selectedRole === "trainee" ? "border-[#00ff66] bg-[#1a1a1b]" : "border-gray-700 bg-[#0d1110]"
                }`}
              >
                {selectedRole === "trainee" && <Check className="absolute top-2 right-2 text-[#00ff66]" />}
                <div className="flex justify-center mb-2"><User className="w-6 h-6 text-[#00ff66]" /></div>
                <p className="text-white font-semibold text-center mb-1">Join as Trainee</p>
                <p className="text-gray-400 text-xs text-center">Learn and train with certified trainers.</p>
              </div>

              <div
                onClick={() => setSelectedRole("trainer")}
                className={`relative w-1/2 cursor-pointer p-4 rounded-xl border ${
                  selectedRole === "trainer" ? "border-[#00ff66] bg-[#1a1a1b]" : "border-gray-700 bg-[#0d1110]"
                }`}
              >
                {selectedRole === "trainer" && <Check className="absolute top-2 right-2 text-[#00ff66]" />}
                <div className="flex justify-center mb-2"><Badge className="w-6 h-6 text-[#00ff66]" /></div>
                <p className="text-white font-semibold text-center mb-1">Join as Trainer</p>
                <p className="text-gray-400 text-xs text-center">Offer guidance and personalized programs.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className={inputClass} />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className={inputClass} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className={inputClass + " pr-10"} />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              <button type="submit" disabled={loading} className="mt-4 w-full py-3 rounded-3xl bg-gradient-to-b from-[#00ff66]/80 to-[#00ff66] text-black font-semibold hover:from-[#00ff66] hover:to-[#00ff66]/90 transition disabled:opacity-50">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-gray-400 text-sm mt-6 text-center">
              Already have an account? <Link href="/Login" className="text-[#00ff66] font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
