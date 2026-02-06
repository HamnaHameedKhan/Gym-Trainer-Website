"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Request {
  id: string;
  status?: "pending" | "accepted" | "rejected";
  created_at: string;

  trainee: {
    id: string;
    name: string;
  } | null;

  trainee_profile: {
    full_name: string;
    profile_image?: string;
    goal: string;
    height: string;
    weight: string;
    waist: string;
    activity_level: string;
    gender: string;
  } | null;
}

export default function HireRequestsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{
    [key: string]: boolean;
  }>({});

  // --- Fetch requests ---
  useEffect(() => {
    const fetchRequests = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      const res = await fetch(
        `/api/trainers/trainee_requests?trainer_id=${sessionData.session.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        },
      );

      const data = await res.json();
      if (data.success) setRequests(data.requests);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  // --- Accept API ---
  const handleAccept = async (requestId: string) => {
    setButtonLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch("/api/trainer_requests/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();

      if (data.success) {
        // Mark as accepted locally
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: "accepted" } : r,
          ),
        );
      }
    } catch (err) {
      console.error("Accept failed", err);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // --- Reject API ---
  const handleReject = async (requestId: string) => {
    setButtonLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch("/api/trainer_requests/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId }),
      });
      const data = await res.json();

      if (data.success) {
        // Mark as rejected locally
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: "rejected" } : r,
          ),
        );
      }
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (!requests.length) return <p className="text-white">No requests found</p>;

  // Filter requests based on active tab
  const displayedRequests = requests.filter((r) => {
    if (activeTab === "pending") return r.status !== "accepted";
    if (activeTab === "history") return r.status === "accepted";
    return true;
  });

  function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime(); // difference in ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  // If more than a week, show date like "2 Feb, 2026"
  return past.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trainees Requests</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and manage incoming training applications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === "pending"
                ? "bg-[#00ff66] text-black"
                : "bg-[#1e1e1e]"
            }`}
          >
            Pending ({requests.filter((r) => r.status !== "accepted").length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === "history"
                ? "bg-[#00ff66] text-black"
                : "bg-[#1e1e1e]"
            }`}
          >
            History ({requests.filter((r) => r.status === "accepted").length})
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRequests.map((req) => (
          <div
            key={req.id}
            className="bg-[#1e1e1e] rounded-xl p-6 shadow-md border-t-4 border-[#00ff66] flex flex-col h-full relative"
          >
            {/* Top */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  req.trainee_profile?.profile_image ||
                  "/trainer-placeholder.png"
                }
                alt={req.trainee_profile?.full_name || "Trainee"}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#00ff66] shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {req.trainee_profile?.full_name || "Unknown"}
                </h3>
                <p className="text-xs text-gray-400">
                  {timeAgo(req.created_at)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div>
                  <p className="text-xs">Goal</p>
                  <p className="text-white font-semibold line-clamp-1">
                    {req.trainee_profile?.goal}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Height</p>
                  <p className="text-white font-semibold">
                    {req.trainee_profile?.height}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Weight</p>
                  <p className="text-white font-semibold">
                    {req.trainee_profile?.weight}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs">Waist</p>
                  <p className="text-white font-semibold">
                    {req.trainee_profile?.waist}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Activity</p>
                  <p className="text-white font-semibold line-clamp-1">
                    {req.trainee_profile?.activity_level}
                  </p>
                </div>
                <div>
                  <p className="text-xs">Gender</p>
                  <p className="text-white font-semibold">
                    {req.trainee_profile?.gender
                      ? req.trainee_profile.gender.charAt(0).toUpperCase() +
                        req.trainee_profile.gender.slice(1)
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            
            {/* Buttons or Rejected badge */}
            {req.status === "pending" || req.status === undefined ? (
              // Pending tab: show Accept + Reject buttons
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={buttonLoading[req.id]}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold
        bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600
        ${buttonLoading[req.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {buttonLoading[req.id] ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={buttonLoading[req.id]}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold
        bg-gradient-to-r from-green-400 to-green-500 hover:from-[#00ff66] hover:to-green-500 text-black
        ${buttonLoading[req.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {buttonLoading[req.id] ? "Accepting..." : "Accept"}
                </button>
              </div>
            ) : req.status === "accepted" && activeTab === "history" ? (
              // History tab: show Accept button only
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={buttonLoading[req.id]}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold
        bg-gradient-to-r from-green-400 to-green-500 hover:from-[#00ff66] hover:to-green-500 text-black
        ${buttonLoading[req.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {buttonLoading[req.id] ? "Accepting..." : "Accepted"}
                </button>
              </div>
            ) : req.status === "rejected" ? (
              // Rejected badge
<div className="mt-6 px-4 py-1 bg-red-500 text-black font-bold rounded w-full text-center">
                Rejected
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
