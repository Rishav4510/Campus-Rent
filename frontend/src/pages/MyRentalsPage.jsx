import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Phone, Mail, Home, Star, X, Building2, ShieldCheck } from "lucide-react";
import api, { getImageUrl } from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";

const MyRentalsPage = () => {
  const { toast } = useNotification();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rentals/mine");
      setRentals(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm("Are you sure you want to cancel this rental request?")) return;
    try {
      await api.put(`/rentals/${rentalId}/status`, { status: "Cancelled" });
      toast("Rental request cancelled");
      loadRentals();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleOpenReview = (rental) => {
    setSelectedRental(rental);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        rentalId: selectedRental._id,
        rating: Number(rating),
        comment: comment.trim(),
      });
      toast("Thank you! Review published ⭐");
      setShowReviewModal(false);
      loadRentals();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Borrower Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Track items you have borrowed, coordinate with owners, and rate completed rentals.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Loading your rentals...</div>
      ) : rentals.length === 0 ? (
        <EmptyState
          title="No rentals yet"
          message="Browse available items on your campus and send a rental request."
          actionText="Explore Campus Items"
          actionLink="/explore"
        />
      ) : (
        <div className="space-y-4">
          {rentals.map((r) => (
            <div
              key={r._id}
              className="p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left: Item + Owner Contact */}
              <div className="flex items-start gap-4">
                <img
                  src={getImageUrl(r.item?.images?.[0] || r.item?.image)}
                  alt={r.item?.name || "item"}
                  className="w-20 h-20 rounded-2xl object-cover bg-gray-100 flex-shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/item/${r.item?._id}`}
                      className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-brand-500"
                    >
                      {r.item?.name}
                    </Link>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60"
                          : r.status === "Pending"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60"
                          : r.status === "Completed"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60"
                          : "bg-gray-100 text-gray-500 dark:bg-zinc-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Owner Contact info (especially critical on Accepted status) */}
                  <div className="text-xs text-gray-600 dark:text-zinc-300">
                    <span className="font-semibold">Owner: {r.owner?.name}</span>
                    {r.status === "Accepted" && (
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        {r.owner?.phone && (
                          <span className="flex items-center gap-1 font-bold">
                            <Phone className="w-3.5 h-3.5" /> Call: {r.owner.phone}
                          </span>
                        )}
                        {r.owner?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {r.owner.email}
                          </span>
                        )}
                        {r.owner?.hostel && (
                          <span className="flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> {r.owner.hostel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dates & Cost */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-800 dark:text-zinc-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} →{" "}
                      {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <span>· Total: ₹{r.totalPrice} ({r.days} day{r.days > 1 ? "s" : ""})</span>
                  </div>

                  {r.item?.location && (
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">
                      📍 Pickup Spot: {r.item.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3 self-end md:self-center">
                {r.status === "Pending" && (
                  <button
                    onClick={() => handleCancelRental(r._id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Cancel Request
                  </button>
                )}

                {r.status === "Completed" && (
                  <button
                    onClick={() => handleOpenReview(r)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-current text-amber-300" /> Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Rate & Review Rental">
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold ml-2 text-gray-800 dark:text-zinc-200">{rating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Your Review & Feedback
            </label>
            <textarea
              rows="4"
              required
              placeholder="How was the condition of the gear? Was the owner on time for handover?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MyRentalsPage;
