"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Trainee {
  id: string;
  full_name: string;
  profile_image?: string;
  status: string;       // e.g., "Active", "Paused"
  active_plan: string | null;
  start_date: string | null;
  completion: number;   // 0-100
}

export default function MyTraineesPage() {
  const [search, setSearch] = useState("");
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) return;

        const trainerId = sessionData.session.user.id;
        const res = await fetch("/api/trainers/my_trainees", {
          headers: {
            "Content-Type": "application/json",
           "trainer-id": trainerId,
          },
        });

        const data = await res.json();
        if (data?.error) throw new Error(data.error);

        // Map API response to frontend structure
        const mapped: Trainee[] = data.map((t: any) => ({
          id: t.id,
          full_name: t.full_name,
          profile_image: t.profile_image || "/trainer-placeholder.png",
          status: "Active",        // Placeholder: can adjust based on plan data
          active_plan: t.active_plan || "N/A",
          start_date: t.start_date || "N/A",
          completion: t.completion || 0,
        }));

        setTrainees(mapped);
        setFilteredTrainees(mapped);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  // Filter + Search
  useEffect(() => {
    let temp = [...trainees];
    if (filterStatus) {
      temp = temp.filter((t) => t.status === filterStatus);
    }
    if (search) {
      temp = temp.filter((t) =>
        t.full_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredTrainees(temp);
  }, [search, filterStatus, trainees]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 md:p-10 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Trainees</h1>
        <p className="text-gray-400">
          Manage your active clients and monitor their progress
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search trainees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1e1e1e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-3 rounded-lg bg-[#1e1e1e] text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Missed Workout">Missed Workout</option>
        </select>
      </div>

      {/* Trainee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainees.map((trainee) => (
          <div
            key={trainee.id}
            className="bg-[#1e1e1e] p-6 rounded-xl flex flex-col gap-4 shadow-md border-t-4 border-green-500"
          >
            {/* Top */}
            <div className="flex items-center gap-4">
              <img
                src={trainee.profile_image || "/trainer-placeholder.png"}
                alt={trainee.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{trainee.full_name}</h3>
                <p
                  className={`text-sm ${
                    trainee.status === "Active"
                      ? "text-green-500"
                      : trainee.status === "Paused"
                      ? "text-yellow-400"
                      : "text-red-500"
                  }`}
                >
                  {trainee.status}
                </p>
              </div>
            </div>

            {/* Plan Details */}
            <div className="text-sm text-gray-300 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p>Active Plan</p>
                <p className="text-white font-bold">{trainee.active_plan}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Start Date</p>
                <p className="text-white font-bold">{trainee.start_date}</p>
              </div>
              <div className="flex justify-between items-center gap-4">
                <p>Plan Completion</p>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-white font-bold">{trainee.completion}%</span>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${trainee.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <button className="flex-1 bg-[#1e1e1e] border border-green-500 text-green-500 py-2 rounded-lg font-semibold hover:bg-green-500 hover:text-black transition">
                Profile
              </button>
              <button className="flex-1 bg-green-500 text-black py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
