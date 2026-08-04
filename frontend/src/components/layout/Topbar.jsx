import { FiMoon, FiSun, FiBell, FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../store/slices/themeSlice";

export default function Topbar() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[var(--color-card-dark)]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="relative w-full max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          placeholder="Search products, orders, customers..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2.5 rounded-full bg-gray-50 dark:bg-gray-800"
        >
          {mode === "light" ? <FiMoon /> : <FiSun className="text-yellow-400" />}
        </button>
        <button className="relative p-2.5 rounded-full bg-gray-50 dark:bg-gray-800">
          <FiBell />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-danger)]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium dark:text-white">{user?.name}</p>
            <p className="text-xs text-[var(--color-muted)] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}