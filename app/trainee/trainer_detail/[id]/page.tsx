"use client";

import { Star, Eye, Briefcase, User, Medal, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

/* ================= TYPES ================= */

interface Plan {
  name: string;
  price: string;
  duration: string;
}

interface Certification {
  name: string;
  file?: string;
}

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface Trainer {
  id: string; // trainer_profiles.id
  user_id: string; // users.id
  full_name: string;
  profile_image?: string;
  bio?: string;
  specializations?: Record<string, number>;
  certificates?: string | Certification[];
  plans?: {
    bronze?: Plan;
    silver?: Plan;
    gold?: Plan;
  };
  rating?: number;
  reviews?: Review[];
}

/* ================= HELPERS ================= */

// Calculate total experience from specialization years
const getTotalExperience = (specializations?: Record<string, number>) => {
  if (!specializations) return 0;
  return Object.values(specializations).reduce(
    (sum, val) => sum + Number(val || 0),
    0,
  );
};

/* ================= PAGE ================= */

export default function TrainerDetailPage() {
  const { id } = useParams();

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  // Request status controls button state & text
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "pending" | "accepted" | "rejected"
  >("idle");

const [planStatuses, setPlanStatuses] = useState<Record<string, "idle" | "pending" | "accepted" | "rejected">>({});


  /* ================= FETCH TRAINER ================= */

  useEffect(() => {
    if (!id) return;

    const fetchTrainer = async () => {
      try {
        const res = await fetch(`/api/trainers/${id}`);
        const data = await res.json();

        if (data.success) {
          setTrainer(data.trainer);
        }
      } catch (error) {
        console.error("Failed to fetch trainer", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [id]);

  /* ================= CHECK REQUEST STATUS ================= */
  /**
   * This runs ONCE trainer is loaded
   * It checks:
   * - No request  → idle
   * - Request sent → pending
   * - Accepted → accepted
   */
  useEffect(() => {
    if (!trainer?.id) return;

    const checkStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) return;

        const res = await fetch(
          `/api/trainees/requests/status?trainer_profile_id=${trainer.id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          },
        );

        const data = await res.json();

        if (data.exists && data.status) {
          setRequestStatus(data.status); // ✅ pending / accepted
        } else {
          setRequestStatus("idle");
        }
      } catch (error) {
        console.error("Status check failed", error);
        setRequestStatus("idle");
      }
    };

    checkStatus();
  }, [trainer?.id]);

  /* ================= SEND REQUEST ================= */
  /**
   * Important rules:
   * - If success → pending
   * - If already sent → pending
   * - Never reset to idle on backend error message
   */
  const sendRequest = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        toast.error("Please login first");
        return;
      }

      // Optimistic UI
      setRequestStatus("pending");

      const res = await fetch("/api/trainees/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          trainer_profile_id: trainer?.id,
        }),
      });

      const data = await res.json();

      // ✅ Request created
      if (data.success) {
        toast.success("Request sent successfully");
        setRequestStatus("pending");
        return;
      }

      // ✅ Already sent case (MOST IMPORTANT FIX)
      if (data.message === "Request already sent") {
        toast.success("Request already sent");
        setRequestStatus("pending");
        return;
      }

      // ❌ Any real error
      toast.error(data.message || "Failed to send request");
      setRequestStatus("idle");
    } catch (error) {
      console.error("Send request failed", error);
      toast.error("Something went wrong");
      setRequestStatus("idle");
    }
  };

  /* ================= select plan ================= */

 const selectPlan = async (planKey: string, plan: Plan) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session) {
      toast.error("Please login first");
      return;
    }

    if (!trainer) return;

    setPlanStatuses(prev => ({ ...prev, [planKey]: "pending" }));

    const res = await fetch("/api/trainers/plan_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainee_id: sessionData.session.user.id,
        trainer_profile_id: trainer.id, // ✅ correct field
        plan_category: planKey,
        price: plan.price,
        duration_months: Number(plan.duration),
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Plan request sent successfully");
    } else {
      toast.error(data.error || "Failed to send plan request");
      setPlanStatuses(prev => ({ ...prev, [planKey]: "idle" }));
    }
  } catch (err) {
    toast.error("Something went wrong");
    setPlanStatuses(prev => ({ ...prev, [planKey]: "idle" }));
  }
};



  /* ================= Check plan status ================= */

  useEffect(() => {
  const checkPlanStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session || !trainer?.id) return;

      const res = await fetch(
        `/api/trainers/plan_requests?trainee_id=${sessionData.session.user.id}&trainer_profile_id=${trainer.id}`
      );
      const data = await res.json();

      // Map each plan_category to its status
      const statusMap: Record<string, "idle" | "pending" | "accepted" | "rejected"> = {};

      data.forEach((req: any) => {
        statusMap[req.plan_category] = req.status; // "pending" | "accepted" | "rejected"
      });

      setPlanStatuses(statusMap);
    } catch (error) {
      console.error("Failed to fetch plan status", error);
    }
  };

  if (trainer?.id) checkPlanStatus();
}, [trainer?.id]);


  /* ================= LOADING / ERROR ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Trainer not found
      </div>
    );
  }

  /* ================= CERTIFICATES PARSE ================= */

  const certificates: Certification[] = (() => {
    try {
      if (typeof trainer.certificates === "string") {
        return JSON.parse(trainer.certificates);
      }
      return trainer.certificates || [];
    } catch {
      return [];
    }
  })();
  /* ================= JSX ================= */
  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-start bg-[#1e1e1e] p-6 rounded-xl">
            <div className="flex gap-6 items-center">
              <img
                src={trainer.profile_image || "/trainer-placeholder.png"}
                alt={trainer.full_name}
                className="w-28 h-28 rounded-full border-2 border-green-400 object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{trainer.full_name}</h2>
                <div className="flex gap-2 mt-2 flex-wrap text-sm text-[#00ff66]">
                  {Object.entries(trainer.specializations || {}).map(
                    ([spec, yrs]) => (
                      <span
                        key={spec}
                        className="bg-black px-2 py-1 rounded-full"
                      >
                        {spec.charAt(0).toUpperCase() + spec.slice(1)} • {yrs}{" "}
                        yrs
                      </span>
                    ),
                  )}
                </div>

                <div className="flex gap-6 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-gray-300">
                    <Star className="w-4 h-4 text-[#00ff66]" />
                    {trainer.rating || 4.5} ({trainer.reviews?.length})
                  </span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <Briefcase className="w-4 h-4 text-[#00ff66]" />
                    {getTotalExperience(trainer.specializations)} Years Exp
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={sendRequest}
              disabled={requestStatus !== "idle"}
              className={`px-6 py-2 rounded-lg font-semibold
            ${
              requestStatus === "idle"
                ? "bg-[#00ff66] text-black"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            >
              {requestStatus === "pending"
                ? "Pending Request"
                : requestStatus === "accepted"
                  ? "Request Accepted"
                  : requestStatus === "rejected"
                    ? "Request Rejected"
                    : "Send Request"}
            </button>
          </div>

          {/* Biography */}
          <section className="bg-[#1e1e1e] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 " />
              <h3 className="text-xl font-semibold">Biography</h3>
            </div>
            <p className="text-gray-300 text-sm">
              {trainer.bio ||
                "Professional fitness trainer. Expert in building custom plans."}
            </p>
          </section>

          {/* Certifications */}
          <section className="bg-[#1e1e1e] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Medal className="w-5 h-5 " />
              <h3 className="text-xl font-semibold">Certifications & Skills</h3>
            </div>
            {certificates.length === 0 ? (
              <p className="text-gray-400 text-sm">No certificates added</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {certificates.map((cert, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 bg-black rounded-full text-xs cursor-pointer hover:bg-green-800"
                    onClick={() => {
                      if (!cert.file) return;

                      if (cert.file.startsWith("data:image")) {
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(
                            `<img src="${cert.file}" style="width:100%;height:auto;" />`,
                          );
                          newWindow.document.title = cert.name;
                        }
                      } else if (cert.file.startsWith("data:application/pdf")) {
                        const newWindow = window.open(cert.file, "_blank");
                        if (newWindow) newWindow.focus();
                      } else {
                        alert("File format not supported to view in new tab.");
                      }
                    }}
                  >
                    {cert.name}
                    {cert.file && <Eye className="w-3 h-3" />}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section className="bg-[#1e1e1e] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 " />
              <h3 className="text-xl font-semibold m-0">Client Reviews</h3>
            </div>
            <div className="flex flex-col gap-4">
              {trainer.reviews?.map((rev) => (
                <div key={rev.id} className="bg-[#121212] p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold">{rev.reviewer}</span>
                    <span className="flex items-center gap-1 text-[#00ff66]">
                      <Star className="w-3 h-3" /> {rev.rating}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{rev.comment}</p>
                  <span className="text-xs text-gray-500">{rev.date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Plans) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {Object.entries(trainer.plans || {}).map(
            ([key, plan], i) =>
              plan && (
                <div
                  key={i}
                  className="relative bg-[#1e1e1e] rounded-xl p-6 border-t-4 border-[#00ff66] shadow-lg"
                >
                  <h4 className="absolute -top-4 left-6 px-3 py-1 rounded-full text-sm font-semibold text-black bg-[#00ff66] capitalize">
                    {key}
                  </h4>
                  <p className="text-lg text-gray-300 font-semibold mt-2">
                    <span className="text-xl font-bold">${plan.price}</span>
                    <span className="text-sm font-normal text-gray-400">
                      /{plan.duration} months
                    </span>
                  </p>
                  <ul className="mt-4 flex flex-col gap-2">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="text-[#00ff66]">✔</span> Customized
                      workout plan
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="text-[#00ff66]">✔</span> Nutrition
                      guidance
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="text-[#00ff66]">✔</span> Weekly progress
                      check
                    </li>
                  </ul>
                  <button
  onClick={() => selectPlan(key, plan)}
  disabled={
    requestStatus !== "accepted" || // can't select plan unless trainer accepted
    planStatuses[key] === "pending" || // already requested
    planStatuses[key] === "accepted"
  }
  className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors duration-300
    ${
      planStatuses[key] === "accepted"
        ? "bg-[#00ff66] text-black hover:bg-green-500"
        : planStatuses[key] === "pending"
          ? "bg-orange-200 text-black cursor-not-allowed"
          : planStatuses[key] === "rejected"
          ? "bg-red-200 text-black cursor-not-allowed"
          : requestStatus === "accepted"
            ? "bg-[#00ff66] text-black hover:bg-green-500"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }`}
>
  {planStatuses[key] === "pending"
    ? "Pending"
    : planStatuses[key] === "accepted"
      ? "Accepted"
      : requestStatus === "accepted"
        ? "Select Plan"
        : "Request Trainer First"}
</button>

                </div>
              ),
          )}
          {!trainer.plans && (
            <p className="text-gray-400 text-sm">No plans available</p>
          )}
        </aside>
      </div>
    </div>
  );
}
