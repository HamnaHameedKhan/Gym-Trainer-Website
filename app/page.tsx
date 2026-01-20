import Image from "next/image";
import Header from "@/components/Header"
import HowItWorks from "@/components/HowItWorks"
import TopRatedTrainers from "@/components/TopRatedTrainers"
import SuccessStories from "@/components/SuccessStories"
import Footer from "@/components/Footer";
import TrainerDashboard from "./pages/TrainerDashboard";
import TraineeDashboard from "./pages/TraineeDashboard";
export default function Home() {
  return (
    <div>
      <Header/>
      <HowItWorks/>
      <TopRatedTrainers/>
      <SuccessStories/>
      <Footer/>
      
    </div>
    
  )
    
}
