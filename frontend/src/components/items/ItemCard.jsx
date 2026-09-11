import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Building2, ShieldCheck, MapPin } from "lucide-react";
import { getImageUrl } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import api from "../../api/axios";
import RatingStars from "../common/RatingStars";

const ItemCard = ({ item, isInitiallyFavorited = false, onFavoriteChange }) => {
  const { isLoggedIn } = useAuth();
  const { toast } = useNotification();
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast("Please log in to save favorites", "info");
      return;
    }
    setFavLoading(true);
    try {
      const { data } = await api.post(`/favorites/toggle/${item._id}`);
      setIsFavorite(data.isFavorite);
      toast(data.message);
      if (onFavoriteChange) onFavoriteChange(item._id, data.isFavorite);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setFavLoading(false);
    }
  };

  const imageSrc = item.images && item.images.length > 0 ? item.images[0] : item.image;

  return (
    <Link
      to={`/item/${item._id}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={getImageUrl(imageSrc)}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/75 dark:bg-zinc-900/75 border border-white/40 dark:border-zinc-700/40 text-gray-700 dark:text-zinc-200 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-md"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Category & Availability Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase backdrop-blur-md bg-zinc-900/80 text-white border border-white/10">
            {item.category}
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold backdrop-blur-md border ${
              item.available && item.status === "active"
                ? "bg-emerald-500/80 text-white border-emerald-400/30"
                : "bg-amber-500/80 text-white border-amber-400/30"
            }`}
          >
            {item.available && item.status === "active" ? "Available" : "Rented Out"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Pickup location tag */}
          <div
            className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium mb-1 truncate"
            title={item.college ? `${item.college.name}, ${item.college.city}` : "Campus Listing"}
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
            <span className="truncate">
              Pickup: {item.college ? `${item.college.name} (${item.college.city})` : "Campus Listing"}
            </span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {item.name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Rating and condition */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800/80">
          <RatingStars rating={item.rating || 5.0} count={item.ratingCount} />
          <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {item.condition}
          </span>
        </div>

        {/* Price and Deposit */}
        <div className="flex items-baseline justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
              ₹{item.pricePerDay}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400">/ day</span>
          </div>
          {item.deposit > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              ₹{item.deposit} deposit
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
