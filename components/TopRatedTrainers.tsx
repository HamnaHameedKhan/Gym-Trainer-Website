import Image from "next/image";
import { Star, Briefcase } from "lucide-react";
import one from "@/app/assets/one.jpg"
import two from "@/app/assets/two.jpg"
import three from "@/app/assets/three.jpg"
import four from "@/app/assets/four.jpg"

export default function TopRatedTrainers() {
  const trainers = [
    { id: 1, name: "Marcus Thompson", specialization: "Bodybuilding", rating: 4.9, exp: "6 yrs Exp", image: one },
    { id: 2, name: "Sarah Jenkins", specialization: "Yoga & Pilates", rating: 5.0, exp: "4 yrs Exp", image: two },
    { id: 3, name: "Carlos Rodriguez", specialization: "HIIT & Cardio", rating: 4.8, exp: "10 yrs Exp", image: three },
    { id: 4, name: "Aiko Tanaka", specialization: "Strength Training", rating: 4.9, exp: "3 yrs Exp", image: four },
  ];

  return (
    <section className="bg-[#0e0e0e] py-20 px-6 md:px-16">
      {/* Heading */}
      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Top Rated Trainers
          </h2>
          <p className="text-gray-400 mt-2">
            Work with the best in the industry.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <a href="#" className="text-[#00ff66] font-semibold hover:underline">
            View All Trainers
          </a>
        </div>
      </div>

      {/* Trainer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-[#0e0e0e] rounded-2xl overflow-hidden transition transform hover:scale-105 hover:shadow-lg">
            {/* Image */}
            <Image
              src={trainer.image}
              alt={trainer.name}
              width={500}
              height={400}
              className="w-full h-60 object-cover"
            />

            {/* Info */}
            <div className="p-4 flex flex-col items-start">
              <p className="text-[#00ff66] font-medium text-sm">{trainer.specialization.toUpperCase()}</p>
              <h3 className="text-white font-semibold text-lg mt-1 mb-2">{trainer.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#00ff66]" />
                  <span>{trainer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{trainer.exp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
