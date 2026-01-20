"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dumbbell, Check, User, Badge, Eye, EyeOff } from "lucide-react";
import signup from "@/app/assets/signup.png";

export default function Signup() {
  const [selectedRole, setSelectedRole] = useState<"trainee" | "trainer" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Please select a role: Trainee or Trainer");
      return;
    }

    alert("Form submitted! Implement your signup logic here.");
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff66]";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Left Image */}
      <div className="md:w-1/2 hidden md:flex">
        <img src={signup.src} alt="Fitness" className="w-full h-screen object-cover" />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 mb-6 cursor-pointer">
              <Dumbbell className="text-[#00ff66] w-7 h-7" />
              <span className="text-white font-bold text-2xl">FITTMATCH</span>
            </div>
          </Link>

          <h2 className="text-white text-3xl font-bold mb-2">Create an Account</h2>
          <p className="text-gray-400 mb-6 text-sm">Sign up and start your fitness journey.</p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <div
              onClick={() => setSelectedRole("trainee")}
              className={`relative w-1/2 cursor-pointer p-4 rounded-xl border ${
                selectedRole === "trainee"
                  ? "border-[#00ff66] bg-[#1a1a1b]"
                  : "border-gray-700 bg-[#0d1110]"
              }`}
            >
              {selectedRole === "trainee" && <Check className="absolute top-2 right-2 text-[#00ff66]" />}
              <div className="flex justify-center mb-2">
                <User
                  className={`w-6 h-6 ${
                    selectedRole === "trainee" ? "text-black" : "text-[#00ff66]"
                  }`}
                />
              </div>
              <p className="text-white font-semibold text-center mb-1">Join as Trainee</p>
              <p className="text-gray-400 text-xs text-center">
                Learn and train with certified trainers.
              </p>
            </div>

            <div
              onClick={() => setSelectedRole("trainer")}
              className={`relative w-1/2 cursor-pointer p-4 rounded-xl border ${
                selectedRole === "trainer"
                  ? "border-[#00ff66] bg-[#1a1a1b]"
                  : "border-gray-700 bg-[#0d1110]"
              }`}
            >
              {selectedRole === "trainer" && <Check className="absolute top-2 right-2 text-[#00ff66]" />}
              <div className="flex justify-center mb-2">
                <Badge
                  className={`w-6 h-6 ${
                    selectedRole === "trainer" ? "text-black" : "text-[#00ff66]"
                  }`}
                />
              </div>
              <p className="text-white font-semibold text-center mb-1">Join as Trainer</p>
              <p className="text-gray-400 text-xs text-center">
                Offer guidance and personalized programs.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-gray-300 mb-1 text-sm">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-300 mb-1 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col relative">
              <label className="text-gray-300 mb-1 text-sm">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={inputClass + " pr-10"}
              />
              <span
                className="absolute right-3 top-11 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#00ff66]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-3 rounded-3xl bg-gradient-to-b from-[#00ff66]/80 to-[#00ff66] text-black font-semibold hover:from-[#00ff66] hover:to-[#00ff66]/90 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link href="/Login" className="text-[#00ff66] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
