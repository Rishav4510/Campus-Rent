import React, { useState, useEffect } from "react";
import { Search, Filter, X, RotateCcw, Building2, SlidersHorizontal, Check, MapPin, Globe } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FilterBar = ({
  filters,
  setFilters,
  categories = [],
  onReset,
}) => {
  const { user } = useAuth();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch all states on mount
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

  // Fetch cities whenever State changes
  useEffect(() => {
    if (!filters.state) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const { data } = await api.get(`/colleges/cities?state=${filters.state}`);
        setCities(data);
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [filters.state]);

  // Fetch colleges whenever State or City changes
  useEffect(() => {
    if (!filters.state) {
      setColleges([]);
      return;
    }
    const fetchColleges = async () => {
      setLoadingColleges(true);
      try {
        const url = filters.city
          ? `/colleges?state=${filters.state}&city=${encodeURIComponent(filters.city)}`
          : `/colleges?state=${filters.state}`;
        const { data } = await api.get(url);
        setColleges(data);
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, [filters.state, filters.city]);

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFilters((prev) => ({
      ...prev,
      state: stateId,
      city: "",
      college: "",
      page: 1,
    }));
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFilters((prev) => ({
      ...prev,
      city: cityName,
      college: "",
      page: 1,
    }));
  };

  const handleCollegeChange = (e) => {
    setFilters((prev) => ({ ...prev, college: e.target.value, page: 1 }));
  };

  const handleClearLocation = () => {
    setFilters((prev) => ({
      ...prev,
      state: "",
      city: "",
      college: "",
      page: 1,
    }));
  };

  const toggleMyCampus = () => {
    if (filters.college === user?.college?._id) {
      handleClearLocation();
    } else if (user?.college) {
      setFilters((prev) => ({
        ...prev,
        college: user.college._id,
        state: user.college.state?._id || user.state?._id || user.college.state || "",
        city: user.college.city || user.city || "",
        page: 1,
      }));
    }
  };

  const isAllIndiaActive = !filters.state && !filters.city && !filters.college;
  const isMyCampusActive = Boolean(user?.college && filters.college === user.college._id);

  return (
    <div className="space-y-4 mb-8">
      {/* Top Search & Location Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search calculators, lab coats, cycles, drafters, books..."
            value={filters.search || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "", page: 1 }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* State Selector */}
        <div className="w-full sm:w-auto sm:min-w-[170px]">
          <select
            value={filters.state || ""}
            onChange={handleStateChange}
            className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200 font-medium"
          >
            <option value="">All India (36 States & UTs)</option>
            {states.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <select
            value={filters.city || ""}
            onChange={handleCityChange}
            disabled={!filters.state || loadingCities}
            className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200 disabled:opacity-50 font-medium"
          >
            <option value="">
              {!filters.state ? "All Cities" : loadingCities ? "Loading Cities..." : "All Cities in State"}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* College Selector */}
        <div className="w-full sm:w-auto sm:min-w-[190px]">
          <select
            value={filters.college || ""}
            onChange={handleCollegeChange}
            disabled={!filters.state || loadingColleges}
            className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200 disabled:opacity-50 font-medium"
          >
            <option value="">
              {!filters.state
                ? "All Colleges"
                : loadingColleges
                ? "Loading Colleges..."
                : "All Colleges in Selection"}
            </option>
            {colleges.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.city}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Drawer Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-colors ${
              showAdvanced
                ? "bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>More Filters</span>
          </button>
          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scope Navigation & Category Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All India default pill */}
        <button
          onClick={handleClearLocation}
          className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isAllIndiaActive
              ? "bg-brand-600 text-white shadow-brand-500/20"
              : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>All India</span>
          {isAllIndiaActive && <Check className="w-3 h-3" />}
        </button>

        {/* My Campus Quick Toggle */}
        {user?.college && (
          <button
            onClick={toggleMyCampus}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isMyCampusActive
                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                : "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 hover:bg-brand-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>My Campus ({user.college.name ? user.college.name.split(" ")[0] : "Campus"})</span>
            {isMyCampusActive && <Check className="w-3 h-3" />}
          </button>
        )}

        <div className="h-4 w-px bg-gray-300 dark:bg-zinc-700 mx-1 flex-shrink-0" />

        {/* Category Pills */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, category: "All", page: 1 }))}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            !filters.category || filters.category === "All"
              ? "bg-gray-900 text-white dark:bg-white dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50"
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id || cat.name}
            onClick={() => setFilters((prev) => ({ ...prev, category: cat.name, page: 1 }))}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filters.category === cat.name
                ? "bg-gray-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* Max Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Max Price: ₹{filters.maxPrice || "Any"}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={filters.maxPrice || 500}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))}
              className="w-full accent-brand-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Condition
            </label>
            <select
              value={filters.condition || "All"}
              onChange={(e) => setFilters((prev) => ({ ...prev, condition: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-800 dark:text-zinc-200"
            >
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Worn">Worn</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Rating
            </label>
            <select
              value={filters.rating || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-800 dark:text-zinc-200"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5★ & above</option>
              <option value="4">4.0★ & above</option>
              <option value="3">3.0★ & above</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <select
              value={filters.sort || "newest"}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-800 dark:text-zinc-200"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Available Only Checkbox */}
          <div className="flex items-center gap-2 pt-2 sm:col-span-2">
            <input
              type="checkbox"
              id="availOnly"
              checked={filters.available === "true"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  available: e.target.checked ? "true" : "",
                  page: 1,
                }))
              }
              className="w-4 h-4 rounded text-brand-600 accent-brand-600"
            />
            <label htmlFor="availOnly" className="text-xs font-medium text-gray-700 dark:text-zinc-300 cursor-pointer">
              Show Available Items Only
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
