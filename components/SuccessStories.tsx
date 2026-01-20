import Image from "next/image";
import { Quote } from "lucide-react";
import one from "@/app/assets/one.jpg";
import two from "@/app/assets/two.jpg";
import three from "@/app/assets/three.jpg";

export default function SuccessStories() {
  const stories = [
    {
      id: 1,
      name: "David Hall",
      role: "Lost 20lbs in 3 months",
      text: "I've never felt stronger. Marcus helped me correct my form and pushed me past my limits. The app makes scheduling so easy.",
      image: one,
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Yoga Enthusiast",
      text: "Finding a yoga instructor who really understands injuries was tough until I found Sarah here. My back pain is gone.",
      image: two,
    },
    {
      id: 3,
      name: "James Wright",
      role: "Athlete",
      text: "The variety of trainers available is amazing. I switch between HIIT and weightlifting depending on my schedule.",
      image: three,
    },
  ];

  return (
    <section className="bg-[#0a0a0a] py-20 px-6 md:px-16">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Success Stories
        </h2>
        <p className="text-gray-400 mt-2">
          Hear from people who transformed their lives.
        </p>
      </div>

      {/* Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-[#0e0e0e] rounded-2xl p-6 flex flex-col gap-4 transition transform hover:scale-105 hover:shadow-lg"
          >
            <Quote className="w-6 h-6 text-[#00ff66]" />
            <p className="text-gray-300 text-sm leading-relaxed">{story.text}</p>
            <div className="flex items-center gap-3 mt-4 ">
              <Image
                src={story.image}
                alt={story.name}
                width={40}
                height={40}
                className="object-cover"
              />
              <div>
                <p className="text-white font-semibold text-sm">{story.name}</p>
                <p className="text-gray-400 text-xs">{story.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
