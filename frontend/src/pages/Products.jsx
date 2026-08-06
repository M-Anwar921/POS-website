import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiSearch, FiEdit2, FiCopy, FiArchive, FiUpload, FiDownload, FiPackage } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import ProductFormModal from "../components/products/ProductFormModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { search, category: categoryFilter, page, limit: 12 } });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      toast.success("Product duplicated");
      fetchProducts();
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  const handleArchive = async (id) => {
    if (!confirm("Archive this product? It will be hidden from the POS and product lists.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product archived");
      fetchProducts();
    } catch {
      toast.error("Failed to archive");
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/products/bulk-export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/products/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Imported ${res.data.data.created} products (${res.data.data.skipped} skipped)`);
      fetchProducts();
    } catch {
      toast.error("Import failed");
    }
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Products</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 dark:text-white">
            <FiDownload size={14} /> Export
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 dark:text-white cursor-pointer">
            <FiUpload size={14} /> Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white"
          >
            <FiPlus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, SKU, or barcode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm focus:outline-none dark:text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--color-muted)]">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                          {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <FiPackage className="text-gray-300" size={16} />}
                        </div>
                        <span className="font-medium dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{p.sku}</td>
                    <td className="px-4 py-3">
                      {p.category?.name && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${p.category.color}20`, color: p.category.color }}>
                          {p.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 dark:text-white">Rs {p.price.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= p.lowStockThreshold ? "text-[var(--color-warning)] font-medium" : "dark:text-white"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingProduct(p); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-muted)]" title="Edit">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(p._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-muted)]" title="Duplicate">
                          <FiCopy size={14} />
                        </button>
                        <button onClick={() => handleArchive(p._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-danger)]" title="Archive">
                          <FiArchive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-[var(--color-muted)]">Page {page} of {pagination.pages} · {pagination.total} products</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 dark:text-white disabled:opacity-40">Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 dark:text-white disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}