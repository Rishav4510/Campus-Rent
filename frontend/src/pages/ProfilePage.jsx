import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Building2,
  Phone,
  Mail,
  Home,
  GraduationCap,
  Calendar,
  Lock,
  Edit2,
  Package,
  Star,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import RatingStars from "../components/common/RatingStars";
import ItemCard from "../components/items/ItemCard";

const ProfilePage = () => {
  const { id } = useParams();
  const { user: loggedInUser, updateProfile, changePassword } = useAuth();
  const { toast } = useNotification();

  const isOwnProfile = !id || id === loggedInUser?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [saving, setSaving] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          const { data } = await api.get("/auth/me");
          setProfileUser(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setHostel(data.hostel || "");
          setCourse(data.course || "");
          setYear(data.year || "1st Year");

          // Load own user profile details
          const pubRes = await api.get(`/auth/users/${data._id}`);
          setActiveItems(pubRes.data.activeItems || []);
          setCompletedCount(pubRes.data.completedRentals || 0);
          setReviews(pubRes.data.reviews || []);
        } else {
          const { data } = await api.get(`/auth/users/${id}`);
          setProfileUser(data.user);
          setActiveItems(data.activeItems || []);
          setCompletedCount(data.completedRentals || 0);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, isOwnProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone, hostel, course, year });
      setProfileUser(updated);
      setEditing(false);
      toast("Profile updated successfully!");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }
    setChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!profileUser) {
    return <div className="py-20 text-center text-sm text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Badge Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
            {profileUser.name ? profileUser.name.slice(0, 2).toUpperCase() : "U"}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {profileUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                {profileUser.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>
                {profileUser.college?.name || "Campus Student"}
                {profileUser.city || profileUser.college?.city ? ` · ${profileUser.city || profileUser.college?.city}` : ""}
                {profileUser.state?.name ? `, ${profileUser.state.name}` : ""}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {profileUser.course || "B.Tech"} · {profileUser.year || "Student"}
              </span>
              {profileUser.hostel && (
                <span className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> {profileUser.hostel}
                </span>
              )}
            </div>

            <div className="pt-1">
              <RatingStars rating={profileUser.rating || 5.0} count={profileUser.ratingCount} />
            </div>
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-8 self-stretch justify-around md:justify-start">
          <div className="text-center">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {activeItems.length}
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
              Items Listed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {completedCount}
            </div>
            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Only for own profile) */}
      {isOwnProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Details */}
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-500" /> Account Details
              </h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Edit Information
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Email (Cannot be changed)
                </label>
                <input
                  type="email"
                  disabled
                  value={profileUser.email}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-950 opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Hostel / Room
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    placeholder="Tagore Hostel, Room 204"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    placeholder="B.Tech Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Year
                  </label>
                  <select
                    disabled={!editing}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 disabled:opacity-60"
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

              {editing && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-sm"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password */}
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-500" /> Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  New Password (Min. 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm transition-all"
              >
                {changingPass ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User's Active Listings */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Active Listings by {profileUser.name} ({activeItems.length})
        </h3>
        {activeItems.length === 0 ? (
          <p className="text-xs text-gray-500">No active listings at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Received */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Reviews & Peer Feedback ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500">No reviews received yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {rev.reviewer?.name || "Student"}
                  </span>
                  <RatingStars rating={rev.rating} size="w-3 h-3" />
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-300">"{rev.comment}"</p>
                <span className="text-[10px] text-gray-400 block">
                  {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
