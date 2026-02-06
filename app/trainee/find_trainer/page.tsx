"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  "",
  "bodybuilding",
  "crossfit",
  "yoga",
  "PPT",
  "diet",
  "cardio",
];

export default function FindTrainerPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 button-level loader
  const [loadingTrainerId, setLoadingTrainerId] = useState<string | null>(null);

  const router = useRouter();

  const getTotalExperience = (specializations: Record<string, any>) => {
    if (!specializations) return 0;

    return Object.values(specializations).reduce(
      (total: number, yrs: any) => total + Number(yrs || 0),
      0
    );
  };

  // ================= FETCH TRAINERS =================
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch("/api/trainers");
        const data = await res.json();

        if (data.success) {
          setTrainers(data.trainers || []);
        }
      } catch (err) {
        console.error("Failed to fetch trainers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredTrainers = trainers.filter((trainer) => {
    const nameMatch = trainer.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const specializationKeys = Object.keys(trainer.specializations || {});
    const filterMatch = filter === "" || specializationKeys.includes(filter);

    return nameMatch && filterMatch;
  });

  // ================= PAGE LOADER =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Loading trainers...
      </div>
    );
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Find Your Perfect Trainer
      </h1>
      <p className="text-gray-400 mb-6">
        Browse by goal, compare experience, and open detailed profiles
      </p>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search trainers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-[#1e1e1e] text-white
                     placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-green-400"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 rounded-lg bg-[#1e1e1e] text-white
                     focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">All Categories</option>
          {categories
            .filter((c) => c !== "")
            .map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
        </select>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {filteredTrainers.map((trainer) => {
          const isLoading = loadingTrainerId === trainer.user_id;

          return (
            <div
              key={trainer.user_id}
              className="w-[340px] flex flex-col bg-gradient-to-r
              from-green-900 to-black rounded-xl
              hover:shadow-[0_0_25px_rgba(0,255,102,0.7)]
              transition-shadow duration-300"
            >
              {/* Top */}
              <div className="flex items-center gap-4 p-5">
                <img
                  src={trainer.profile_image || "/trainer-placeholder.png"}
                  alt={trainer.full_name}
                  className="w-16 h-16 object-cover rounded-full border-2 border-green-400"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {trainer.full_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#00ff66]" />
                    <span className="text-[#00ff66] font-semibold">4.5</span>
                    <span className="text-gray-400 text-sm">(0 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="px-5 flex-1">
                <p className="text-gray-300 text-sm line-clamp-3">
                  {trainer.bio || "Professional fitness trainer"}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(trainer.specializations || {}).map(
                    ([spec, years]: [string, any]) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-black text-white rounded-full text-xs"
                      >
                        {spec.charAt(0).toUpperCase() + spec.slice(1)} •{" "}
                        {years} yrs
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex justify-between items-center px-5 pb-5 mt-auto">
                <span className="text-gray-400 text-sm">
                  {getTotalExperience(trainer.specializations) > 0
                    ? `${getTotalExperience(
                        trainer.specializations
                      )} Years Experience`
                    : "Certified Trainer"}
                </span>

                <button
                  disabled={isLoading}
                  onClick={() => {
                    setLoadingTrainerId(trainer.user_id);
                    router.push(
                      `/trainee/trainer_detail/${trainer.user_id}`
                    );
                  }}
                  className={`px-4 py-2 rounded-full flex items-center gap-2
                    ${
                      isLoading
                        ? "bg-gray-400 text-black cursor-not-allowed"
                        : "bg-[#00ff66] text-black hover:scale-105"
                    }
                    shadow-[0_0_15px_rgba(0,255,102,0.7)]
                    transition-transform`}
                >
                  {isLoading && (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoading ? "Loading..." : "View Profile"}
                </button>
              </div>
            </div>
          );
        })}

        {filteredTrainers.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center">
            No trainers found 😕
          </p>
        )}
      </div>
    </div>
  );
}
