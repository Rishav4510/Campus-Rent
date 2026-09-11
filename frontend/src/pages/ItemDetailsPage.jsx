import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Heart,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import api, { getImageUrl } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import RatingStars from "../components/common/RatingStars";
import Modal from "../components/common/Modal";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useNotification();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Rental Request Modal State
  const [showRentModal, setShowRentModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [submittingRent, setSubmittingRent] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Scam");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Favorite State
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data.item);
        setReviews(data.reviews || []);

        if (isLoggedIn) {
          const favRes = await api.get(`/favorites/check/${id}`);
          setIsFavorite(favRes.data.isFavorite);
        }
      } catch (err) {
        console.error("Error loading item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id, isLoggedIn]);

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      toast("Please log in to favorite items", "info");
      return;
    }
    try {
      const { data } = await api.post(`/favorites/toggle/${id}`);
      setIsFavorite(data.isFavorite);
      toast(data.message);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleContactOwner = async () => {
    if (!isLoggedIn) {
      toast("Please log in to contact the owner", "info");
      navigate("/login");
      return;
    }
    if (user._id === item.owner._id) {
      toast("You are the owner of this item!", "info");
      return;
    }
    try {
      await api.post("/chat/start", {
        recipientId: item.owner._id,
        itemId: item._id,
      });
      navigate("/messages");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  // Date preview calculations
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  };

  const days = calculateDays();
  const rentalCost = days * (item?.pricePerDay || 0);
  const deposit = item?.deposit || 0;
  const grandTotal = rentalCost + deposit;

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast("Please select both start and end dates", "error");
      return;
    }
    setSubmittingRent(true);
    try {
      await api.post("/rentals", {
        itemId: item._id,
        startDate,
        endDate,
        note,
      });
      toast("Rental request sent to owner! 🎉");
      setShowRentModal(false);
      navigate("/my-rentals");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmittingRent(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await api.post("/reports", {
        item: item._id,
        reportedUser: item.owner._id,
        reason: reportReason,
        description: reportDescription,
      });
      toast("Report submitted. Admin will review promptly.", "info");
      setShowReportModal(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-gray-500 mt-4">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Item Not Found</h2>
        <p className="text-sm text-gray-500">The listing may have been deleted or expired.</p>
        <Link to="/explore" className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs">
          Back to Explore
        </Link>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [item.image || ""];
  const isOwner = user && user._id === item.owner?._id;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 shadow-md">
            <img
              src={getImageUrl(images[activeImageIndex])}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleFavoriteToggle}
                className="p-3 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-white/30 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:text-rose-500 shadow-lg transition-all"
                title="Save Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? "border-brand-500 scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Item Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                {item.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                Condition: {item.condition}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  item.available && item.status === "active"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                }`}
              >
                {item.available && item.status === "active" ? "Available Now" : "Currently Rented"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {item.name}
            </h1>

            <div className="flex items-center gap-2 pt-1">
              <RatingStars rating={item.rating || 5.0} count={item.ratingCount || 0} size="w-4 h-4" />
              <span className="text-xs text-gray-400">· {item.views || 0} views</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  ₹{item.pricePerDay}
                </span>
                <span className="text-sm text-gray-500 dark:text-zinc-400"> / day</span>
              </div>
              {item.deposit > 0 && (
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block font-medium">
                    Refundable Deposit
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                    ₹{item.deposit}
                  </span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Security deposit is fully refunded once the item is returned safely.</span>
            </div>
          </div>

          {/* Location & Physical Pickup Transparency */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-zinc-200">
              <Building2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span className="font-bold">
                {item.college?.name}
                {item.college?.city ? ` (${item.college.city}${item.college.state?.name ? `, ${item.college.state.name}` : ""})` : ""}
              </span>
            </div>
            {item.location && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Pickup Spot: <strong className="text-gray-800 dark:text-zinc-200">{item.location}</strong></span>
              </div>
            )}
            <div className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
              ⚠️ <strong>Physical pickup required:</strong> Any student across India can browse and rent, but handover and return take place physically at <strong>{item.college?.name || "the specified campus"}, {item.college?.city || ""}</strong>.
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Description & Notes
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Owner Profile Card */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
                {item.owner?.name ? item.owner.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div>
                <Link to={`/profile/${item.owner?._id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500">
                  {item.owner?.name}
                </Link>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {item.owner?.course || "Student"} · {item.owner?.year || ""}
                </p>
                <div className="mt-0.5">
                  <RatingStars rating={item.owner?.rating || 5.0} size="w-3 h-3" />
                </div>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleContactOwner}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                <span>Chat</span>
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            {isOwner ? (
              <Link
                to={`/edit-item/${item._id}`}
                className="w-full text-center block py-3.5 rounded-2xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
              >
                Edit Your Listing
              </Link>
            ) : item.available && item.status === "active" ? (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    toast("Please log in to request a rental", "info");
                    navigate("/login");
                    return;
                  }
                  setShowRentModal(true);
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
              >
                Request to Rent
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-2xl font-bold text-sm text-center bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 cursor-not-allowed">
                Currently Rented Out
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 px-1">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Report Listing
              </button>
              <span>Pickup at {item.college?.city || "Campus"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="pt-8 border-t border-gray-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Item Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            No reviews yet. Be the first to rent and rate this item!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-800 font-bold text-xs flex items-center justify-center">
                      {rev.reviewer?.name?.slice(0, 1) || "S"}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {rev.reviewer?.name}
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} size="w-3 h-3" />
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-300">{rev.comment}</p>
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
      </section>

      {/* Booking Modal */}
      <Modal isOpen={showRentModal} onClose={() => setShowRentModal(false)} title="Request to Rent">
        <form onSubmit={handleRentSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Pricing breakdown calculation */}
          {days > 0 && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 space-y-1.5 text-xs text-brand-900 dark:text-brand-200 font-medium">
              <div className="flex justify-between">
                <span>
                  Rental ({days} day{days > 1 ? "s" : ""} × ₹{item.pricePerDay})
                </span>
                <span>₹{rentalCost}</span>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>Refundable Security Deposit</span>
                  <span>+ ₹{deposit}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-brand-200 dark:border-brand-800 flex justify-between font-bold text-sm text-brand-700 dark:text-brand-300">
                <span>Estimated Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Note to Owner (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Need this for Monday mid-term exam. Can meet at library gate."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={submittingRent || days <= 0}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md disabled:opacity-50 transition-all"
          >
            {submittingRent ? "Sending Request..." : `Confirm & Send Request (₹${grandTotal})`}
          </button>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Listing">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
            >
              <option value="Scam">Scam or Fraudulent</option>
              <option value="Fake item">Fake / Counterfeit item</option>
              <option value="Wrong information">Wrong or Misleading Information</option>
              <option value="Offensive content">Offensive or Inappropriate Content</option>
              <option value="Suspicious activity">Suspicious Activity</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Details
            </label>
            <textarea
              rows="3"
              placeholder="Explain the issue with this listing..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={submittingReport}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all"
          >
            {submittingReport ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ItemDetailsPage;
