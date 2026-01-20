"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import login from "@/app/assets/login.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Form submitted! Implement your login logic here.");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
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

          {/* Welcome Text */}
          <h2 className="text-white text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Enter your credentials to access your personalized training dashboard.
          </p>

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff66]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col relative">
              <label className="text-white text-sm mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg bg-[#0e0f10] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff66]"
                required
              />
              <span
                className="absolute right-3 top-11 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#00ff66]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#00ff66]"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              <button type="button" className="hover:text-[#00ff66]">
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-b from-[#00ff66]/80 to-[#00ff66] text-black font-semibold hover:from-[#00ff66] hover:to-[#00ff66]/90 shadow-md shadow-black/50 transition"
            >
              Login
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-gray-400 text-sm mt-6 text-center">
            Don't have an account?{" "}
            <Link href="/Signup" className="text-[#00ff66] font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
