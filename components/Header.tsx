import Link from "next/link";
import { Dumbbell } from "lucide-react";
import gymBg from "../app/assets/gym-bg.jpg";

export default function Header() {
  return (
    <section
      style={{ backgroundImage: `url(${gymBg.src})` }}
      className="relative min-h-screen bg-cover bg-center"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-16 py-5">
        {/* Left logo */}
        <div className="flex items-center gap-2">
          <Dumbbell className="text-[#00ff66] w-6 sm:w-7 h-6 sm:h-7" />
          <span className="text-white font-bold text-lg sm:text-xl tracking-wide">
            FIT<span className="text-[#00ff66]">MATCH</span>
          </span>
        </div>

        {/* Center menu */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-10 text-white font-medium text-sm md:text-base">
          <li className="hover:text-[#00ff66] cursor-pointer">Trainers</li>
          <li className="hover:text-[#00ff66] cursor-pointer">How it works</li>
          <li className="hover:text-[#00ff66] cursor-pointer">Reviews</li>
          <li className="hover:text-[#00ff66] cursor-pointer">Pricing</li>
        </ul>

        {/* Right buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
           <Link href="/Login">
          <button className="text-white border border-white/30 px-3 sm:px-4 py-2 rounded-3xl hover:bg-white/10 transition text-sm sm:text-base">
            Login
          </button>
          </Link>

            <Link href="/Signup">
          <button className="bg-[#00ff66] text-black px-3 sm:px-4 py-2 rounded-3xl hover:opacity-90 transition text-sm sm:text-base">
            Sign Up
          </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center md:justify-between px-4 sm:px-6 md:px-16 pt-20 md:pt-28">
        {/* Left content */}
        <div className="max-w-full sm:max-w-md md:max-w-xl text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="text-white">FIND YOUR PERFECT</span>{" "}
            <span className="text-[#00ff66]">FITNESS TRAINER</span>
          </h1>

          <p className="text-gray-300 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg px-2 sm:px-0">
            Connect with certified fitness trainers and achieve your goals with
            personalized workout plans designed just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 mb-12 justify-center md:justify-start px-2 sm:px-0">
            <button className="bg-[#00ff66] text-black px-5 sm:px-6 py-3 rounded-3xl font-semibold hover:opacity-90 transition text-sm sm:text-base">
              Join as Trainee
            </button>
            <button className="border border-white/30 text-white px-5 sm:px-6 py-3 rounded-3xl font-semibold hover:bg-white/10 transition text-sm sm:text-base">
              Become a Trainer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
