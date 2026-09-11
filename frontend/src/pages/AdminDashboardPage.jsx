import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Building2,
  Package,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/common/Modal";

const AdminDashboardPage = () => {
  const { toast } = useNotification();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'colleges' | 'items' | 'rentals' | 'reports'
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [states, setStates] = useState([]);
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add College Modal state
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeState, setNewCollegeState] = useState("");
  const [newCollegeCity, setNewCollegeCity] = useState("");
  const [newCollegeType, setNewCollegeType] = useState("University");
  const [newCollegeWebsite, setNewCollegeWebsite] = useState("");
  const [submittingCollege, setSubmittingCollege] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, colRes, itemsRes, rentalsRes, repRes, statesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/colleges"),
        api.get("/admin/items"),
        api.get("/admin/rentals"),
        api.get("/reports"),
        api.get("/states"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setColleges(colRes.data);
      setItems(itemsRes.data);
      setRentals(rentalsRes.data);
      setReports(repRes.data);
      setStates(statesRes.data);
      if (statesRes.data.length > 0 && !newCollegeState) {
        setNewCollegeState(statesRes.data[0]._id);
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/status`);
      toast(data.message);
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Remove this user permanently?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast("User removed");
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Remove this item listing permanently?")) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      toast("Item removed by admin");
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status });
      toast(`Report marked as ${status}`);
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleToggleCollegeStatus = async (collegeId) => {
    try {
      const { data } = await api.patch(`/colleges/${collegeId}/status`);
      toast(data.message);
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    setSubmittingCollege(true);
    try {
      await api.post("/colleges", {
        name: newCollegeName.trim(),
        state: newCollegeState,
        city: newCollegeCity.trim(),
        type: newCollegeType,
        website: newCollegeWebsite.trim(),
      });
      toast("College added successfully! 🏫");
      setShowAddCollege(false);
      setNewCollegeName("");
      setNewCollegeCity("");
      setNewCollegeWebsite("");
      loadAll();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmittingCollege(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            System metrics, user moderation, college directory, and fraud oversight.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Students</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.totalUsers}</div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Colleges</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.totalColleges}</div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Items</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.totalItems}</div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Rentals</div>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{stats.activeRentals}</div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completedRentals}</div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending Reports</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats.pendingReports}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-6 overflow-x-auto">
        {[
          { key: "users", label: `Users (${users.length})` },
          { key: "colleges", label: `Colleges (${colleges.length})` },
          { key: "items", label: `Listings (${items.length})` },
          { key: "rentals", label: `Rentals (${rentals.length})` },
          { key: "reports", label: `Reports (${reports.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                    <td className="p-4 text-gray-500 dark:text-zinc-400">{u.email}</td>
                    <td className="p-4 text-gray-600 dark:text-zinc-300">{u.college?.name || "—"}</td>
                    <td className="p-4 uppercase text-[10px] font-bold">{u.role}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          u.active !== false
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
                            : "bg-red-50 text-red-600 dark:bg-red-950"
                        }`}
                      >
                        {u.active !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.role !== "admin" && (
                        <>
                          <button
                            onClick={() => handleToggleUserStatus(u._id)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"
                          >
                            {u.active !== false ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Colleges */}
      {activeTab === "colleges" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddCollege(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New College
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">College Name</th>
                    <th className="p-4">State</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Website</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {colleges.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="p-4">{c.state?.name || "—"}</td>
                      <td className="p-4">{c.city}</td>
                      <td className="p-4 text-gray-500">{c.type}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            c.active !== false
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
                              : "bg-red-50 text-red-600 dark:bg-red-950"
                          }`}
                        >
                          {c.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-brand-600">
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noreferrer" className="hover:underline">
                            Website ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleCollegeStatus(c._id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            c.active !== false
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/60 dark:hover:bg-amber-950/40"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
                          }`}
                        >
                          {c.active !== false ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Items Moderation */}
      {activeTab === "items" && (
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Price/Day</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{it.name}</td>
                    <td className="p-4">{it.category}</td>
                    <td className="p-4">{it.owner?.name || "—"}</td>
                    <td className="p-4 text-gray-500">{it.college?.name || "—"}</td>
                    <td className="p-4 font-extrabold text-brand-600">₹{it.pricePerDay}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(it._id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50"
                      >
                        Remove Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rentals */}
      {activeTab === "rentals" && (
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Borrower</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {rentals.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{r.item?.name || "Item removed"}</td>
                    <td className="p-4">{r.renter?.name || "—"}</td>
                    <td className="p-4">{r.owner?.name || "—"}</td>
                    <td className="p-4 font-bold">₹{r.totalPrice}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-gray-100 dark:bg-zinc-800">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item / User</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No reports filed. Everything is clean! 🎉
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        {rep.item?.name || rep.reportedUser?.name || "Listing"}
                      </td>
                      <td className="p-4">{rep.reporter?.name || "Student"}</td>
                      <td className="p-4 font-semibold text-red-500">{rep.reason}</td>
                      <td className="p-4 max-w-xs truncate text-gray-600 dark:text-zinc-300">{rep.description}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            rep.status === "Pending"
                              ? "bg-amber-50 text-amber-600"
                              : rep.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {rep.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleResolveReport(rep._id, "Resolved")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep._id, "Dismissed")}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add College Modal */}
      <Modal isOpen={showAddCollege} onClose={() => setShowAddCollege(false)} title="Add College to Directory">
        <form onSubmit={handleAddCollege} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              College Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BITS Pilani (Goa Campus)"
              value={newCollegeName}
              onChange={(e) => setNewCollegeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                State / UT *
              </label>
              <select
                value={newCollegeState}
                onChange={(e) => setNewCollegeState(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              >
                {states.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zuarinagar"
                value={newCollegeCity}
                onChange={(e) => setNewCollegeCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                College Type
              </label>
              <input
                type="text"
                placeholder="Autonomous / Central / State"
                value={newCollegeType}
                onChange={(e) => setNewCollegeType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Official Website
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newCollegeWebsite}
                onChange={(e) => setNewCollegeWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingCollege}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md"
          >
            {submittingCollege ? "Adding..." : "Add College"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
