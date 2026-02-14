"use client";

import { Check, X, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

interface PlanRequest {
  id: string;
  name: string;
  email: string;
  plan: string;
  price: string;
  duration: string;
  start: string;
  expiry: string;
  status: "pending" | "approved" | "rejected";
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

export default function PlanRequestsPage() {
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------
     FETCH PLAN REQUESTS (SYNCED WITH ROUTE)
  -----------------------------------------*/
  const fetchPlanRequests = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        toast.error("Please login first");
        return;
      }

      const user_id = sessionData.session.user.id;

      // 1️⃣ Get trainer_profile_id from trainer_profiles
      const { data: trainerProfile, error: profileError } = await supabase
        .from("trainer_profiles")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !trainerProfile) {
        toast.error("Trainer profile not found");
        return;
      }

      const trainer_profile_id = trainerProfile.id;

      // 2️⃣ Call API with trainer_profile_id
      const res = await fetch(
        `/api/trainers/plan_requests?trainer_profile_id=${trainer_profile_id}`
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch plan requests");
        return;
      }

      // 3️⃣ Format API response for UI
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.users?.full_name || "N/A",
        email: item.users?.email || "N/A",
        plan: item.plan_category,
        price: `$${item.price}`,
        duration: `${item.duration_months} Months`,
        start: new Date(item.start_date).toLocaleDateString(),
        expiry: new Date(item.expiry_date).toLocaleDateString(),
        status: item.status,
      }));

      setPlanRequests(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanRequests();
  }, []);

  /* ----------------------------------------
     APPROVE / REJECT
  -----------------------------------------*/
  const updateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const res = await fetch("/api/trainers/update_plan_status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }

      toast.success(`Plan ${newStatus}`);

      // Instant UI update
      setPlanRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Plan Requests</h1>
        <p className="text-sm text-gray-400">
          Review and approve trainee subscription plans
        </p>
      </div>

      {/* Search + Filter (UI unchanged) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search trainee..."
            className="w-full bg-[#111716] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-green-400"
          />
        </div>

        <select className="bg-[#111716] border border-white/10 rounded-lg px-3 py-2 text-sm w-full sm:w-40">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-[#111716] text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Trainee</th>
              <th className="px-4 py-3 text-left">Selected Plan</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">Expiry Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {planRequests.map((item) => (
              <tr key={item.id} className="hover:bg-white/5">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="font-medium">{item.plan}</p>
                  <p className="text-xs text-gray-400">{item.price}</p>
                </td>

                <td className="px-4 py-4">{item.duration}</td>
                <td className="px-4 py-4">{item.start}</td>
                <td className="px-4 py-4">{item.expiry}</td>

                <td className="px-4 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusStyles[item.status]
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() +
                      item.status.slice(1)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {item.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(item.id, "approved")}
                        className="flex items-center gap-1 bg-green-500/15 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/25 transition"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "rejected")}
                        className="flex items-center gap-1 bg-red-500/15 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 capitalize">
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
