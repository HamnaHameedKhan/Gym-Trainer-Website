"use client";

import React, { useState, useEffect } from "react";
import { Search, X, User, Activity, Scale, Target } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TraineeProfile {
  full_name: string;
  gender: string;
  height: number | string;
  weight: number | string;
  waist: number | string;
  goal: string;
  profile_image?: string;
}

interface Trainee {
  id: string;
  full_name: string;
  profile_image?: string;
  status: string; // e.g., "Active", "Paused"
  active_plan: string | null;
  start_date: string | null;
  completion: number; // 0-100
  trainee_profile?: TraineeProfile;
}

export default function MyTraineesPage() {
  const [search, setSearch] = useState("");
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================= Fetch Trainees ================= */
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

        const mapped: Trainee[] = data.trainees.map((t: any) => ({
          id: t.id,
          full_name: t.full_name,
          profile_image: t.profile_image || "/trainer-placeholder.png",
          status: "Active", // Placeholder
          active_plan: t.active_plan || "N/A",
          start_date: t.start_date || "N/A",
          completion: t.completion || 0,
          trainee_profile: t, // Pass full trainee_profile for modal
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

  /* ================= Filter + Search ================= */
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

  /* ================= Modal ================= */
  const openModal = (profile: TraineeProfile) => {
    setSelectedTrainee(profile);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrainee(null);
  };

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
                  <span className="text-white font-bold">
                    {trainee.completion}%
                  </span>
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
              <button
                onClick={() => openModal(trainee.trainee_profile!)}
                className="flex-1 bg-[#1e1e1e] border border-green-500 text-green-500 py-2 rounded-lg font-semibold hover:bg-[#00ff66] hover:text-black transition"
              >
                Profile
              </button>
              <button className="flex-1 bg-[#00ff66] text-black py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= Modal ================= */}
      {isModalOpen && selectedTrainee && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] rounded-xl p-6 w-full max-w-md relative shadow-lg">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedTrainee.profile_image || "/trainer-placeholder.png"}
                alt={selectedTrainee.full_name}
                className="w-16 h-16 rounded-full border-2 border-green-500 object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{selectedTrainee.full_name}</h2>
                <span className="text-green-500 text-sm">Active Trainee</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#121212] p-3 rounded-lg flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-400">Gender</p>
                  <p className="text-white text-sm">{selectedTrainee.gender}</p>
                </div>
              </div>
              <div className="bg-[#121212] p-3 rounded-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-400">Height</p>
                  <p className="text-white text-sm">{selectedTrainee.height}</p>
                </div>
              </div>
              <div className="bg-[#121212] p-3 rounded-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="text-white text-sm">{selectedTrainee.weight}</p>
                </div>
              </div>
              <div className="bg-[#121212] p-3 rounded-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-400">Waist</p>
                  <p className="text-white text-sm">{selectedTrainee.waist}</p>
                </div>
              </div>
            </div>

            {/* Primary Goal */}
            <div className="bg-[#121212] p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-xs text-gray-400 mb-1">PRIMARY GOAL</p>
              <p className="text-white text-sm">{selectedTrainee.goal}</p>
            </div>
<div className="flex justify-center mt-4">
  <button className="bg-[#00ff66] text-black px-6 py-2 rounded-xl font-medium hover:bg-green-600 opacity-90 transition">
    Assign Workout
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}
