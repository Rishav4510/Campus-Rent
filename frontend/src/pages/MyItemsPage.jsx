import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  PlusCircle,
  Calendar,
  Check,
  X,
  Phone,
  Mail,
  Home,
  Clock,
  Trash2,
  Edit,
  Building2,
} from "lucide-react";
import api, { getImageUrl } from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import EmptyState from "../components/common/EmptyState";

const MyItemsPage = () => {
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'requests'
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, reqRes] = await Promise.all([
        api.get("/items/mine/list"),
        api.get("/rentals/requests"),
      ]);
      setItems(itemsRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailable = async (itemId, currentVal) => {
    try {
      await api.put(`/items/${itemId}`, { available: !currentVal });
      toast("Item availability updated");
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/items/${itemId}`);
      toast("Item removed successfully");
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleUpdateStatus = async (rentalId, status) => {
    try {
      await api.put(`/rentals/${rentalId}/status`, { status });
      toast(`Rental marked as ${status.toLowerCase()}`);
      loadData();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage your gear listings and respond to incoming rental requests.
          </p>
        </div>
        <Link
          to="/add-item"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Another Item</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "items"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          My Listed Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "requests"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span>Incoming Requests ({requests.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: My Listed Items */}
      {activeTab === "items" && (
        <div>
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500">Loading your items...</div>
          ) : items.length === 0 ? (
            <EmptyState
              title="You haven't listed anything yet"
              message="Put your calculator, lab coat, cycle, or drafter up for rent and start earning."
              actionText="+ List Your First Item"
              actionLink="/add-item"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <img
                        src={getImageUrl(it.images?.[0] || it.image)}
                        alt={it.name}
                        className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                          {it.category}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {it.name}
                        </h4>
                        <div className="text-xs font-extrabold text-gray-800 dark:text-zinc-200 mt-1">
                          ₹{it.pricePerDay} <span className="text-[10px] font-normal text-gray-400">/ day</span>
                        </div>
                        {it.deposit > 0 && (
                          <div className="text-[11px] text-gray-400">₹{it.deposit} deposit</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          it.available && it.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                            : "bg-amber-50 dark:bg-amber-950 text-amber-600"
                        }`}
                      >
                        {it.available && it.status === "active" ? "Available" : "Rented / Inactive"}
                      </span>
                      <span className="text-gray-400 text-[11px]">{it.views || 0} views</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-gray-50/70 dark:bg-zinc-950/40 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleAvailable(it._id, it.available)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                    >
                      {it.available ? "Mark Unavailable" : "Mark Available"}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/edit-item/${it._id}`}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-brand-500 hover:bg-white"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(it._id)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Rental Requests */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No rental requests yet"
              message="When another student requests one of your items, it will appear here with their contact information."
              actionText="View Your Items"
              actionLink="/my-items"
            />
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div
                  key={r._id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Item + Renter Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={getImageUrl(r.item?.images?.[0] || r.item?.image)}
                      alt={r.item?.name || "item"}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {r.item?.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            r.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
                              : r.status === "Pending"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950"
                              : r.status === "Completed"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950"
                              : "bg-gray-100 text-gray-600 dark:bg-zinc-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      {/* Renter contact info */}
                      <p className="text-xs text-gray-600 dark:text-zinc-300 font-medium">
                        Borrower: {r.renter?.name} ({r.renter?.course || "Student"})
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                        {r.renter?.phone && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Phone className="w-3.5 h-3.5" /> {r.renter.phone}
                          </span>
                        )}
                        {r.renter?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {r.renter.email}
                          </span>
                        )}
                        {r.renter?.hostel && (
                          <span className="flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> {r.renter.hostel}
                          </span>
                        )}
                      </div>

                      {/* Dates and Note */}
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} →{" "}
                          {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <span>· ₹{r.totalPrice} ({r.days} day{r.days > 1 ? "s" : ""})</span>
                      </div>

                      {r.note && (
                        <p className="text-xs italic text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg mt-1">
                          "{r.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {r.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r._id, "Accepted")}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r._id, "Rejected")}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/60 hover:bg-red-50 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    )}

                    {r.status === "Accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(r._id, "Completed")}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
                      >
                        Mark Returned / Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyItemsPage;
