import React from "react";
import { Star } from "lucide-react";

const RatingStars = ({ rating = 5.0, count = 0, size = "w-3.5 h-3.5" }) => {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rounded ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-zinc-600"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
        {Number(rating).toFixed(1)}
      </span>
      {count > 0 && (
        <span className="text-[11px] text-gray-400 dark:text-zinc-500">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
