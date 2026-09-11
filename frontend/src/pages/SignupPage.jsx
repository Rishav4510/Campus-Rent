import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Mail, Lock, Building2, MapPin, Phone, Home, GraduationCap } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useNotification();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("1st Year");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch States on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data } = await api.get("/states");
        setStates(data);
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    };
    fetchStates();
  }, []);

  // Fetch Cities whenever State changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      setSelectedCity("");
      setColleges([]);
      setSelectedCollege("");
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const { data } = await api.get(`/colleges/cities?state=${selectedState}`);
        setCities(data);
        setSelectedCity("");
        setColleges([]);
        setSelectedCollege("");
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedState]);

  // Fetch Colleges whenever State or City changes
  useEffect(() => {
    if (!selectedState) {
      setColleges([]);
      setSelectedCollege("");
      return;
    }
    const fetchColleges = async () => {
      setLoadingColleges(true);
      try {
        const url = selectedCity
          ? `/colleges?state=${selectedState}&city=${encodeURIComponent(selectedCity)}`
          : `/colleges?state=${selectedState}`;
        const { data } = await api.get(url);
        setColleges(data);
        if (data.length > 0) {
          setSelectedCollege(data[0]._id);
        } else {
          setSelectedCollege("");
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, [selectedState, selectedCity]);

  const filteredColleges = colleges.filter((c) => {
    if (!collegeSearch) return true;
    const q = collegeSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (!selectedState || !selectedCollege) {
      toast("Please select your State and College", "error");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        state: selectedState,
        city: selectedCity,
        college: selectedCollege,
        course: course.trim(),
        year,
        phone: phone.trim(),
        hostel: hostel.trim(),
      });
      toast(`Account created! Welcome, ${user.name.split(" ")[0]}! 🎉`);
      navigate("/explore");
    } catch (err) {
      toast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            CR
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Join Your Campus Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            Select your college to connect with fellow student owners and borrowers.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Rishav Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="you@campus.edu or gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* State & City & College Selection */}
            <div className="space-y-3 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                <Building2 className="w-4 h-4 text-brand-500" />
                <span>Campus Location (State → City → College)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* State */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    State / UT *
                  </label>
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200"
                  >
                    <option value="">Select State / UT</option>
                    {states.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Campus City
                  </label>
                  <select
                    disabled={!selectedState || loadingCities}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200 disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedState
                        ? "Select State First"
                        : loadingCities
                        ? "Loading Cities..."
                        : "All Cities in State"}
                    </option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* College with search */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    College / Institution * ({filteredColleges.length} available)
                  </label>
                  {colleges.length > 3 && (
                    <span className="text-[10px] text-gray-400">Searchable</span>
                  )}
                </div>

                {colleges.length > 3 && (
                  <input
                    type="text"
                    placeholder="Search college by name, code, or city..."
                    value={collegeSearch}
                    onChange={(e) => setCollegeSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-800 dark:text-zinc-200 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500"
                  />
                )}

                <select
                  required
                  disabled={!selectedState || loadingColleges}
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200 disabled:opacity-50"
                >
                  <option value="">
                    {!selectedState
                      ? "Select State First"
                      : loadingColleges
                      ? "Loading Colleges..."
                      : filteredColleges.length === 0
                      ? "No colleges found matching search"
                      : "Select College"}
                  </option>
                  {filteredColleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course and Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Course / Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE / Mechanical"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Postgraduate</option>
                  <option>Faculty / Staff</option>
                </select>
              </div>
            </div>

            {/* Phone and Hostel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Phone (Shown on booking accept)
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Hostel / Block
                </label>
                <input
                  type="text"
                  placeholder="Block C / Tagore Hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password and Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Password (Min 6) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
