import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotification();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get("/categories"),
          api.get(`/items/${id}`),
        ]);
        setCategories(catRes.data);
        const it = itemRes.data.item;
        setName(it.name);
        setDescription(it.description);
        setCategory(it.category);
        setPricePerDay(it.pricePerDay);
        setDeposit(it.deposit || 0);
        setCondition(it.condition || "Good");
        setLocation(it.location || "");
        setAvailable(it.available);
      } catch (err) {
        toast("Failed to load item for editing", "error");
        navigate("/my-items");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/items/${id}`, {
        name,
        description,
        category,
        pricePerDay: Number(pricePerDay),
        deposit: Number(deposit),
        condition,
        location,
        available,
      });
      toast("Listing updated successfully!");
      navigate(`/item/${id}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Edit Listing</h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Update pricing, description, availability, or location.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Item Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
            >
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Worn">Worn</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            rows="4"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Price per Day (₹)
            </label>
            <input
              type="number"
              min="5"
              required
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Deposit (₹)
            </label>
            <input
              type="number"
              min="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
            Pickup Spot / Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isAvail"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 accent-brand-600"
          />
          <label htmlFor="isAvail" className="text-xs font-semibold text-gray-800 dark:text-zinc-200 cursor-pointer">
            Mark Item as Available for Rent
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-1/2 py-3 rounded-xl font-semibold text-xs border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-1/2 py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemPage;
