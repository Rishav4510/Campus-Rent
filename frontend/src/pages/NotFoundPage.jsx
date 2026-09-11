import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8 animate-spin" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-sm mt-2 mb-6">
        The link you followed may be broken, or the page may have been moved.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
