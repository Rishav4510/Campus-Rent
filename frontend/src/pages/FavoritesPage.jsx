import React, { useState, useEffect } from "react";
import api from "../api/axios";
import ItemCard from "../components/items/ItemCard";
import EmptyState from "../components/common/EmptyState";
import { GridSkeleton } from "../components/common/LoadingSkeleton";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/favorites");
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleFavoriteChange = (itemId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((item) => item._id !== itemId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Saved Favorites
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Items you've bookmarked for upcoming exams, lab practicals, or trips.
        </p>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No favorites saved yet"
          message="Click the heart icon on any listing card to save items here for quick access."
          actionText="Browse Marketplace"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              isInitiallyFavorited={true}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
