import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ItemCard from "../components/items/ItemCard";
import FilterBar from "../components/items/FilterBar";
import { GridSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { useAuth } from "../context/AuthContext";

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "All",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    college: searchParams.get("college") || "",
    condition: searchParams.get("condition") || "All",
    maxPrice: searchParams.get("maxPrice") || "",
    available: searchParams.get("available") || "",
    rating: searchParams.get("rating") || "",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
  });

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Fetch items whenever filters change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category && filters.category !== "All") params.set("category", filters.category);
        if (filters.state) params.set("state", filters.state);
        if (filters.city) params.set("city", filters.city);
        if (filters.college) params.set("college", filters.college);
        if (filters.condition && filters.condition !== "All") params.set("condition", filters.condition);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.available) params.set("available", filters.available);
        if (filters.rating) params.set("rating", filters.rating);
        if (filters.sort) params.set("sort", filters.sort);
        params.set("page", filters.page);
        params.set("limit", 12);

        setSearchParams(params, { replace: true });

        const { data } = await api.get(`/items?${params.toString()}`);
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      state: "",
      city: "",
      college: "",
      condition: "All",
      maxPrice: "",
      available: "",
      rating: "",
      sort: "newest",
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Explore Campus Gear
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          India-wide marketplace. Browse and rent items from campus peers across India with transparent physical pickup spots.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Results Count and Location Scope Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
          Showing {total} item{total === 1 ? "" : "s"}
        </span>
        {filters.college ? (
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900">
            Filtered by campus
          </span>
        ) : filters.city ? (
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900">
            City: {filters.city}
          </span>
        ) : filters.state ? (
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900">
            Filtered by state
          </span>
        ) : (
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
            🇮🇳 Nationwide Marketplace (All India)
          </span>
        )}
      </div>

      {/* Items Grid or Empty State */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          message="We couldn't find any items matching those filters or keywords. Try widening your search or selecting a different campus."
          actionText="Clear All Filters"
          actionLink="#"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          {Array.from({ length: pages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                  filters.page === pageNum
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
