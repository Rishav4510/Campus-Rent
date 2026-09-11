import React from "react";

export const ItemCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 animate-pulse">
    <div className="h-44 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
    <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
      <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-full w-16" />
    </div>
  </div>
);

export const GridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ItemCardSkeleton key={i} />
    ))}
  </div>
);

export default GridSkeleton;
