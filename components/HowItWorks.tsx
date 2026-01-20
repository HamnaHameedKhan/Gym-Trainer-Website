import {
  UserCheck,
  Dumbbell,
  CalendarCheck,
  Search,
  Calendar,
  Goal,
  GoalIcon,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="bg-black py-20 px-6 md:px-16">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          How It <span className="text-[#00ff66]">Works</span>
        </h2>
        <p className="text-gray-400 mt-4">
          Getting started with FitMatch is simple, fast, and designed to help
          you achieve your fitness goals effortlessly.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div
          className="bg-[#0e0e0e] rounded-2xl p-8 flex flex-col items-start gap-4 text-center md:text-left 
+ transition transform hover:scale-105 hover:shadow-lg"
        >
          <Search className="text-[#00ff66] w-10 h-10 mx-auto md:mx-0" />
          <h3 className="text-white text-xl font-semibold">
            1. Find a Trainer
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Browse verified trainers, compare expertise, and select the one that
            best matches your fitness journey.
          </p>
        </div>

        {/* Card 2 */}
        <div
          className="bg-[#0e0e0e] rounded-2xl p-8 flex flex-col items-start gap-4 text-center md:text-left 
+ transition transform hover:scale-105 hover:shadow-lg"
        >
          {" "}
          {/* Icon with circle background */}
          <div className="bg-[#00ff66]/20 w-16 h-16 rounded-full flex items-center justify-center">
            <Calendar className="text-[#00ff66] w-8 h-8" />
          </div>
          <h3 className="text-white text-xl font-semibold">
            2. Book a Session
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Schedule a consultation or training session directly through our
            platform. Seamless messaging and booking.
          </p>
        </div>

        {/* Card 3 */}
        <div
          className="bg-[#0e0e0e] rounded-2xl p-8 flex flex-col items-start gap-4 text-center md:text-left 
+ transition transform hover:scale-105 hover:shadow-lg"
        >
          {" "}
          {/* Icon with circle background */}
          <div className="bg-[#00ff66]/20 w-16 h-16 rounded-full flex items-center justify-center">
            <GoalIcon className="text-[#00ff66] w-8 h-8" />
          </div>
          <h3 className="text-white text-xl font-semibold">3. Achieve Goals</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Follow your personalized plan ,track your progress,and reach new
            heights with expert guidance.
          </p>
        </div>
      </div>
    </section>
  );
}
