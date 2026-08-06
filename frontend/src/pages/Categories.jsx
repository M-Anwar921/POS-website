import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiFolder } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import CategoryFormModal from "../components/categories/CategoryFormModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
      setTree(res.data.tree);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const renderCategory = (cat, isChild = false) => (
    <div key={cat._id} className={isChild ? "ml-8 mt-2" : "mb-2"}>
      <div className="flex items-center justify-between bg-white dark:bg-[var(--color-card-dark)] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
            {isChild ? <FiTag style={{ color: cat.color }} size={16} /> : <FiFolder style={{ color: cat.color }} size={16} />}
          </div>
          <span className="text-sm font-medium dark:text-white">{cat.name}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setEditingCategory(cat); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-muted)]">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-danger)]">
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
      {cat.children?.map((child) => renderCategory(child, true))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Categories</h1>
        <button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white"
        >
          <FiPlus size={14} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : tree.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-10 text-sm">No categories yet</p>
      ) : (
        tree.map((cat) => renderCategory(cat))
      )}

      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          parentOptions={categories.filter((c) => !c.parent)}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchCategories(); }}
        />
      )}
    </div>
  );
}