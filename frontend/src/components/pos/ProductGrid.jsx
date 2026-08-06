import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiCamera } from "react-icons/fi";
import api from "../../api/axios";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import ProductDetailModal from "./ProductDetailModal";

export default function ProductGrid({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { search, category: activeCategory, limit: 100 } });
      setProducts(res.data.data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleBarcodeSearch = async (e) => {
    if (e.key !== "Enter" || !search.trim()) return;
    try {
      const res = await api.get(`/products/barcode/${search.trim()}`);
      onAddToCart(res.data.data);
      setSearch("");
      toast.success(`${res.data.data.name} added`);
    } catch (error) {
      // Not a barcode match — falls through to normal text search, no error needed
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleBarcodeSearch}
            placeholder="Search or scan barcode..."
            id="pos-search"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
          />
          <FiCamera className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" title="Barcode scanner ready" />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            activeCategory === "" ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)]"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === cat._id ? "text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)]"
            }`}
            style={activeCategory === cat._id ? { backgroundColor: cat.color } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] py-10 text-sm">No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 group">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onAdd={onAddToCart} onViewDetails={setSelectedProduct} />
            ))}
          </div>
        )}
      </div>
      {selectedProduct && (
  <ProductDetailModal
    product={selectedProduct}
    onClose={() => setSelectedProduct(null)}
    onAdd={onAddToCart}
  />
)}
    </div>
  );
}