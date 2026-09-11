import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Zap,
  Repeat,
  BadgePercent,
  Users,
  CheckCircle2,
  BookOpen,
  Calculator,
  FlaskConical,
  Compass,
  Laptop,
  Trophy,
  Bike,
  Home,
  Music,
  Package,
} from "lucide-react";
import api from "../api/axios";
import ItemCard from "../components/items/ItemCard";
import { GridSkeleton } from "../components/common/LoadingSkeleton";
import { useAuth } from "../context/AuthContext";

const categoryIconMap = {
  Books: BookOpen,
  Calculators: Calculator,
  "Lab Equipment": FlaskConical,
  "Drawing Tools": Compass,
  Electronics: Laptop,
  "Sports Equipment": Trophy,
  Cycles: Bike,
  "Hostel Essentials": Home,
  "Musical Instruments": Music,
  Others: Package,
};

const LandingPage = () => {
  const { user, selectedCollege } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalColleges: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, itemsRes, collegesRes] = await Promise.all([
          api.get("/categories"),
          api.get("/items?limit=8&available=true"),
          api.get("/colleges"),
        ]);
        setCategories(catRes.data);
        setFeaturedItems(itemsRes.data.items);
        setStats({
          totalItems: itemsRes.data.total || 9,
          totalColleges: collegesRes.data.length || 28,
          totalUsers: 150,
        });
      } catch (err) {
        console.error("Home loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-brand-50/50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                <span>India's Student-to-Student Campus Rental Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
                Rent what you need. <br />
                <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  Earn from what you don't.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                Need a scientific calculator for your semester exam? A lab coat for practicals? A drafter for graphics? Borrow from fellow students on your campus for low daily rates.
              </p>

              {/* Hero Search Box */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl">
                <div className="flex items-center p-1.5 rounded-2xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/50 dark:shadow-none focus-within:ring-2 focus-within:ring-brand-500">
                  <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search calculator, lab coat, cycle, drafter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-sm shadow-brand-600/20"
                  >
                    Find Gear
                  </button>
                </div>
              </form>

              {/* CTAs & Quick Metrics */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 active:scale-95 transition-all"
                >
                  <span>Explore Items</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/add-item"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm active:scale-95 transition-all"
                >
                  <span>+ List an Item</span>
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-zinc-800/80">
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {stats.totalColleges}+
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium mt-0.5">
                    Colleges
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    ₹0
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium mt-0.5">
                    Listing Fee
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                    100%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium mt-0.5">
                    Peer to Peer
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Floating Mockup Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md space-y-4">
                {/* Floating Card 1: Casio Calculator */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                      Calculators
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available Now
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=200&auto=format&fit=crop&q=80"
                      alt="Calculator"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Casio FX-991ES Plus
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        KIET Group of Institutions · Tagore Hostel
                      </p>
                      <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                        ₹25 <span className="text-[11px] font-normal text-gray-400">/ day</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Lab Coat */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-300 ml-4 sm:ml-8">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      Lab Equipment
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      Size M · Washed
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80"
                      alt="Lab Coat"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Cotton Chemistry Lab Apron
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        IIT Delhi · Mechanical Dept
                      </p>
                      <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                        ₹30 <span className="text-[11px] font-normal text-gray-400">/ day</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 3: Mini Drafter */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl space-y-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                      Drawing Tools
                    </span>
                    <span className="text-xs font-semibold text-amber-500">★ 5.0 Rating</span>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&auto=format&fit=crop&q=80"
                      alt="Mini Drafter"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Engineering Graphics Drafter
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        RV College of Engineering · Cauvery Block
                      </p>
                      <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                        ₹35 <span className="text-[11px] font-normal text-gray-400">/ day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus First Discovery Banner */}
      {user?.college && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5" /> Your Campus
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold">
                {user.college.name}
              </h3>
              <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
                Browse gear listed by students in your own hostel and departments. Hand off between lectures in minutes.
              </p>
            </div>
            <Link
              to={`/explore?college=${user.college._id}`}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-brand-900 bg-white hover:bg-brand-50 shadow-md transition-all flex-shrink-0 active:scale-95"
            >
              View Campus Items →
            </Link>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Find the exact gear you need for exams, labs, sports, and daily commute
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIconMap[cat.name] || Package;
            return (
              <Link
                key={cat._id || cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-brand-500/50 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                    {cat.description || "Student gear"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Listed & Available Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Featured Available Items
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Verified listings ready for pickup today across top Indian colleges
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Browse Full Catalog →
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : featuredItems.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-zinc-400">
            No items listed yet. Be the first to list something!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredItems.slice(0, 8).map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section (5 Steps) */}
      <section className="bg-gray-100/70 dark:bg-zinc-900/50 py-16 border-y border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider uppercase">
              Simple & Seamless
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              How CampusRent Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-2">
              From finding gear to returning it after your exams, everything happens safely on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Sign Up with College",
                desc: "Choose your State and College to join your campus marketplace community.",
                icon: Building2,
              },
              {
                step: "02",
                title: "Find Needed Item",
                desc: "Search calculators, lab gear, cycles, or books available right in your hostel blocks.",
                icon: Search,
              },
              {
                step: "03",
                title: "Send Rental Request",
                desc: "Pick your start and end dates. System auto-calculates rent and deposit transparently.",
                icon: Zap,
              },
              {
                step: "04",
                title: "Meet & Collect",
                desc: "Chat with the owner, meet at the campus library or canteen for quick handoff.",
                icon: CheckCircle2,
              },
              {
                step: "05",
                title: "Return & Review",
                desc: "Hand it back on time, deposit is released, and leave a verified peer review.",
                icon: Repeat,
              },
            ].map((s) => {
              const StepIcon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 relative space-y-3"
                >
                  <div className="text-3xl font-black text-gray-200 dark:text-zinc-800">
                    {s.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {s.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why CampusRent Value Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider uppercase">
            Trust & Security
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Built Exclusively for Students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Verified Campus Community
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Every member is linked to their college, course, and year. No strangers or sketchy external meetups.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BadgePercent className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Affordable Daily Rates
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Why pay ₹1,500 for a calculator you only need for three exams? Borrow it for ₹25 a day and save your pocket money.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Zero Shipping Hassles
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Direct physical handovers right inside your campus. Hand it back outside your hostel or academic block.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white border border-zinc-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Have unused gear sitting in your hostel room?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Put your calculator, cycle, drafter, or sports kit to work and start earning between semesters.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              to="/add-item"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-zinc-950 bg-brand-500 hover:bg-brand-400 shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
            >
              List an Item Now
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 active:scale-95 transition-all"
            >
              Create Free Student Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
