import { Dumbbell, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-10">
        {/* Logo & Description */}
        <div className="flex flex-col gap-4 w-full md:w-1/3 max-w-xs">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Dumbbell className="text-[#00ff66] w-7 h-7" />
            FITTMATCH
          </h2>
          <p className="text-gray-400 text-sm">
            Connecting fitness enthusiasts with world-class trainers. Achieve your goals with personalized guidance anytime, anywhere.
          </p>
        </div>

        {/* Three Link Sections */}
        <div className="flex flex-col sm:flex-row justify-between w-full md:w-2/3 gap-6 sm:gap-12 md:gap-16">
          {/* Platform */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Platform</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">Browse Trainers</li>
              <li className="hover:text-white cursor-pointer">How It Works</li>
              <li className="hover:text-white cursor-pointer">Pricing</li>
              <li className="hover:text-white cursor-pointer">Success Stories</li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Company</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Careers</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Support</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto px-4 gap-4 sm:gap-0">
        <p className="text-gray-500 text-sm text-center sm:text-left">
          © 2024 FittMatch Inc. All rights reserved.
        </p>
        <div className="flex gap-4 justify-center sm:justify-start">
          <Instagram className="hover:text-white cursor-pointer" size={20} />
          <Twitter className="hover:text-white cursor-pointer" size={20} />
          <Facebook className="hover:text-white cursor-pointer" size={20} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
