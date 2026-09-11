import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, HeartHandshake, MapPin, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                CR
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
                Campus<span className="text-brand-500">Rent</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              India's premier student-to-student rental marketplace. Rent calculators, lab coats, drafters, cycles, and books directly from peers at your college.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-medium">
              <MapPin className="w-3.5 h-3.5" /> 33+ States & Union Territories
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Explore Gear
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-400">
              <li><Link to="/explore?category=Calculators" className="hover:text-brand-500">Engineering Calculators</Link></li>
              <li><Link to="/explore?category=Lab Equipment" className="hover:text-brand-500">Lab Coats & Aprons</Link></li>
              <li><Link to="/explore?category=Drawing Tools" className="hover:text-brand-500">Mini Drafters & Boards</Link></li>
              <li><Link to="/explore?category=Cycles" className="hover:text-brand-500">Campus Cycles</Link></li>
              <li><Link to="/explore?category=Books" className="hover:text-brand-500">Textbooks & Sem Notes</Link></li>
            </ul>
          </div>

          {/* Safety & Community */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Campus Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-400">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-500" /> Verified Student IDs</li>
              <li className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5 text-brand-500" /> In-Person Handover</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-500" /> Refundable Deposits</li>
              <li><Link to="/explore" className="hover:text-brand-500">Campus First Matching</Link></li>
            </ul>
          </div>

          {/* Account & Support */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Get Started
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600 dark:text-zinc-400">
              <li><Link to="/signup" className="hover:text-brand-500">Student Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-brand-500">Student Log In</Link></li>
              <li><Link to="/add-item" className="hover:text-brand-500">List an Item for Rent</Link></li>
              <li><Link to="/my-rentals" className="hover:text-brand-500">Rental Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} CampusRent Technologies. Built by students, for students.</p>
          <p className="flex items-center gap-1">
            Empowering student communities across Indian Campuses 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
