"use client";

import { Star, Eye, Briefcase, User, Medal, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

/* ================= Types ================= */

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
  id: string;
  user_id: string;
  full_name: string;
  profile_image?: string;
  bio?: string;
  specializations?: Record<string, number>;
  certificates?: string | Certification[] | string;
  plans?: {
    bronze?: Plan;
    silver?: Plan;
    gold?: Plan;
  };
  rating?: number;
  reviews?: Review[];
  clients_count?: number;
}

/* ================= Helper ================= */

const getTotalExperience = (specializations?: Record<string, number>) => {
  if (!specializations) return 0;
  return Object.values(specializations).reduce(
    (sum, val) => sum + Number(val || 0),
    0,
  );
};

/* ================= Page ================= */

export default function TrainerDetailPage() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "pending" | "accepted"
  >("idle");

  /* ================= Fetch Trainer ================= */
  useEffect(() => {
    if (!id) return;

    const fetchTrainer = async () => {
      try {
        const res = await fetch(`/api/trainers/${id}`);
        const data = await res.json();

        if (data.success) {
          const reviews = data.trainer.reviews || [
            {
              id: "1",
              reviewer: "David K.",
              rating: 5,
              comment:
                "Marcus is incredible. Added skills to my default in just 3 months.",
              date: "2 days ago",
            },
            {
              id: "2",
              reviewer: "Sarah L.",
              rating: 5,
              comment:
                "Highly recommended! Explains the 'why' behind every exercise.",
              date: "1 week ago",
            },
          ];

          setTrainer({ ...data.trainer, reviews });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [id]);

  /* ================= Check Request Status ================= */
  useEffect(() => {
    if (!trainer?.id) return;

    const checkRequestStatus = async () => {
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
        if (data.exists) {
          // data.status can be "pending" or "accepted"
          setRequestStatus(data.status);
        } else {
          setRequestStatus("idle");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkRequestStatus();
  }, [trainer?.id]);

  /* ================= Send Request ================= */
  const sendRequest = async () => {
    try {
      const trainer_id = trainer?.user_id; // users.id
      if (!trainer_id) return toast.error("Trainer ID missing");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        return toast.error("You must be logged in to send a request");
      }

      const accessToken = sessionData.session.access_token;
      setRequestStatus("pending");

      const res = await fetch("/api/trainees/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          trainer_profile_id: trainer.id,
        }),
      });

      const data = await res.json();

      if (data?.exists) {
        setRequestStatus("pending");
      } else {
        setRequestStatus("idle");
      }

      if (data.success) {
        toast.success("Request sent successfully!");
        setRequestStatus("pending");
      } else {
        setRequestStatus("idle");
        toast.error(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
      setRequestStatus("idle");
      toast.error("Something went wrong");
    }
  };

  /* ================= Loading / Error ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Trainer not found.
      </div>
    );
  }

  /* ================= JSONB Certificates ================= */
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
              disabled={
                requestStatus === "pending" || requestStatus === "accepted"
              }
              onClick={sendRequest}
              className={`px-6 py-2 rounded-lg font-semibold transition
    ${
      requestStatus === "pending" || requestStatus === "accepted"
        ? "bg-gray-600 cursor-not-allowed text-white"
        : "bg-[#00ff66] text-black hover:scale-105"
    }`}
            >
              {requestStatus === "pending"
                ? "Pending Request"
                : requestStatus === "accepted"
                  ? "Request Accepted"
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
                    disabled={requestStatus !== "accepted"}
                    className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors duration-300
    ${
      requestStatus === "accepted"
        ? "bg-[#00ff66] text-black hover:bg-green-500"
        : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }`}
                  >
                    Select Plan
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
