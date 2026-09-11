import React from "react";
import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";

const EmptyState = ({
  title = "No items found",
  message = "Try changing your search keywords or switching filters.",
  actionText = "Explore All Items",
  actionLink = "/explore",
  icon: Icon = PackageOpen,
}) => {
  return (
    <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {actionText && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
