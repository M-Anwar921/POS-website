import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProductPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!search) return setResults([]);
    const t = setTimeout(() => {
      api.get("/products", { params: { search, limit: 8 } }).then((res) => setResults(res.data.data));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleSelect = (product) => {
    setSelected(product);
    setSearch(product.name);
    setResults([]);
    onChange(product);
  };

  return (
    <div className="relative">
      <input
        placeholder="Search product by name or SKU..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); if (selected) { setSelected(null); onChange(null); } }}
        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
      />
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
            >
              {p.name} <span className="text-xs text-[var(--color-muted)]">({p.sku})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}