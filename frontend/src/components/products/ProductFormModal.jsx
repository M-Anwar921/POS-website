import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FiX, FiUploadCloud, FiPackage } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category?._id || "",
    price: product?.price || "",
    cost: product?.cost || "",
    stock: product?.stock ?? "",
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    description: product?.description || "",
    image: product?.image || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await api.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: res.data.data.url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), cost: Number(form.cost) || 0, stock: Number(form.stock) };
      if (product) {
        await api.put(`/products/${product._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">{product ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-[var(--color-primary)] bg-blue-50 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <input {...getInputProps()} />
            {form.image ? (
              <img src={form.image} alt="" className="w-24 h-24 object-cover rounded-xl mx-auto" />
            ) : (
              <div className="flex flex-col items-center gap-1 py-3 text-[var(--color-muted)]">
                <FiUploadCloud size={22} />
                <p className="text-xs">{uploading ? "Uploading..." : "Drag & drop or click to upload image"}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input placeholder="Barcode (auto if blank)" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="col-span-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
              <option value="">No category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input type="number" step="0.01" placeholder="Cost" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input type="number" placeholder="Low stock alert at" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="col-span-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />
          </div>

          <button type="submit" disabled={saving || uploading} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}