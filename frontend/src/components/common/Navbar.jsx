import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Bell,
  MessageSquare,
  Heart,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Building2,
  Package,
  Calendar,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout, selectedCollege } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-gray-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                CR
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                  Campus<span className="text-brand-500">Rent</span>
                </span>
                <span className="hidden sm:block text-[10px] text-gray-500 dark:text-zinc-400 font-medium tracking-wide uppercase">
                  College Marketplace
                </span>
              </div>
            </Link>

            {/* Selected Campus Badge */}
            {selectedCollege && (
              <div
                onClick={() => navigate("/explore")}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900/50 cursor-pointer hover:bg-brand-100 transition-colors"
                title="Your Active Campus"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-500" />
                <span className="max-w-[200px] truncate">{selectedCollege.name}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive("/explore")
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-zinc-900"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Explore
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/my-rentals"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/my-rentals")
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-zinc-900"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  My Rentals
                </Link>
                <Link
                  to="/my-items"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/my-items")
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-zinc-900"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  My Items
                </Link>
                <Link
                  to="/favorites"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/favorites")
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-zinc-900"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Favorites
                </Link>
                <Link
                  to="/messages"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive("/messages")
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-zinc-900"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Messages
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-amber-600 dark:text-amber-400 ${
                      isActive("/admin") ? "bg-amber-50 dark:bg-zinc-900" : "hover:text-amber-700"
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                {/* List Item CTA Button */}
                <Link
                  to="/add-item"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm shadow-brand-600/20 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List an Item</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 mt-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-gray-500 dark:text-zinc-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                                n.read
                                  ? "opacity-75 hover:bg-gray-50 dark:hover:bg-zinc-800/40"
                                  : "bg-brand-50/50 dark:bg-brand-950/20 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-gray-900 dark:text-zinc-100">
                                  {n.title}
                                </span>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-gray-700 dark:text-zinc-300 max-w-[100px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                      <div className="p-2 border-b border-gray-100 dark:border-zinc-800 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{user?.email}</p>
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-medium truncate">
                          🏫 {user?.college?.name || "Campus Student"}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-items"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-500" />
                        My Listed Items
                      </Link>
                      <Link
                        to="/my-rentals"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-gray-500" />
                        My Rentals
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm shadow-brand-600/20 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-2">
          {selectedCollege && (
            <div className="py-2 px-3 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-xs text-brand-700 dark:text-brand-300 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="truncate">{selectedCollege.name}</span>
            </div>
          )}
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
          >
            <Compass className="w-4 h-4 text-brand-500" /> Explore Catalog
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/add-item"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30"
              >
                <PlusCircle className="w-4 h-4" /> + List an Item
              </Link>
              <Link
                to="/my-rentals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                <Calendar className="w-4 h-4 text-blue-500" /> My Rentals
              </Link>
              <Link
                to="/my-items"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                <Package className="w-4 h-4 text-emerald-500" /> My Listed Items
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                <Heart className="w-4 h-4 text-rose-500" /> Favorites
              </Link>
              <Link
                to="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                <MessageSquare className="w-4 h-4 text-purple-500" /> Messages
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                <User className="w-4 h-4 text-amber-500" /> Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
                >
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-sm border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
