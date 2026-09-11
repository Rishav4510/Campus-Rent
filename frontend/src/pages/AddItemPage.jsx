import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus, Sparkles, Building2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const AddItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useNotification();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...selectedFiles, ...files].slice(0, 5); // limit to 5 images
    setSelectedFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !category || !pricePerDay) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("pricePerDay", pricePerDay);
      formData.append("deposit", deposit || 0);
      formData.append("condition", condition);
      formData.append("location", location.trim());
      if (user?.college?._id) formData.append("college", user.college._id);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const { data } = await api.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast("Item listed successfully! 🚀");
      navigate(`/item/${data._id}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="space-y-2 mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          List an Item for Rent
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
          Turn idle college gear into extra cash. Your item will be visible to students across campuses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campus indicator */}
        {user?.college && (
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-brand-900 dark:text-brand-200 block">
                Primary Campus: {user.college.name}
              </span>
              <span className="text-brand-700 dark:text-brand-400">
                Students from your campus will see this item first.
              </span>
            </div>
          </div>
        )}

        {/* Basic Information Panel */}
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            1. Basic Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Casio FX-991ES Plus Calculator / Size M Lab Coat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200"
              >
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-zinc-200"
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Description & Usage Notes *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Describe condition, what's included, any usage notes or battery status..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Pricing & Deposit Panel */}
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            2. Pricing & Handover
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Price per Day (₹) *
              </label>
              <input
                type="number"
                min="5"
                required
                placeholder="25"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Refundable Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="200"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Pickup Location / Preferred Meeting Point
            </label>
            <input
              type="text"
              placeholder="e.g. Tagore Hostel Gate / Central Library Canteen"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Photos Upload Panel */}
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              3. Photos (Up to 5)
            </h3>
            <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
          </div>

          {/* Upload Drop Area */}
          <label className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300">
              Click to select item photos
            </span>
            <span className="text-xs text-gray-400 mt-1">Clear photos attract 3x more requests</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 group">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-md hover:scale-110 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl font-extrabold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/20 active:scale-95 disabled:opacity-50 transition-all"
        >
          {submitting ? "Publishing Listing..." : "Publish Item for Rent"}
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
