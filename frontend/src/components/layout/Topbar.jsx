import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMoon, FiSun, FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../store/slices/themeSlice";
import api from "../../api/axios";
import socket from "../../lib/socket";

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const searchRef = useRef(null);

  const fetchNotifications = () => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    });
  };

  useEffect(() => {
    fetchNotifications();
    socket.on("notification:new", (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return () => socket.off("notification:new");
  }, []);

  useEffect(() => {
    if (!query) return setResults(null);
    const t = setTimeout(() => {
      api.get("/search", { params: { q: query } }).then((res) => setResults(res.data.data));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleMarkAllRead = async () => {
    await api.put("/notifications/read-all");
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const goTo = (path) => {
    setSearchOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-white/80 dark:bg-[var(--color-card-dark)]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-full bg-gray-50 dark:bg-gray-800 shrink-0">
          <FiMenu />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            id="global-search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
          />
          {searchOpen && query && results && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {results.products.length === 0 && results.customers.length === 0 && results.orders.length === 0 && results.suppliers.length === 0 ? (
                <p className="p-4 text-sm text-[var(--color-muted)]">No results found</p>
              ) : (
                <>
                  {results.products.map((p) => (
                    <button key={p._id} onClick={() => goTo("/products")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                      <span className="text-xs text-[var(--color-muted)] mr-2">Product</span>{p.name}
                    </button>
                  ))}
                  {results.customers.map((c) => (
                    <button key={c._id} onClick={() => goTo("/customers")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                      <span className="text-xs text-[var(--color-muted)] mr-2">Customer</span>{c.name}
                    </button>
                  ))}
                  {results.orders.map((o) => (
                    <button key={o._id} onClick={() => goTo("/orders")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                      <span className="text-xs text-[var(--color-muted)] mr-2">Order</span>{o.orderNumber}
                    </button>
                  ))}
                  {results.suppliers.map((s) => (
                    <button key={s._id} onClick={() => goTo("/suppliers")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                      <span className="text-xs text-[var(--color-muted)] mr-2">Supplier</span>{s.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button onClick={() => dispatch(toggleTheme())} className="p-2.5 rounded-full bg-gray-50 dark:bg-gray-800">
          {mode === "light" ? <FiMoon /> : <FiSun className="text-yellow-400" />}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-full bg-gray-50 dark:bg-gray-800">
            <FiBell />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-danger)]" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto z-20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold dark:text-white">Notifications</span>
                <button onClick={handleMarkAllRead} className="text-xs text-[var(--color-primary)]">Mark all read</button>
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-[var(--color-muted)]">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                    <p className="text-sm font-medium dark:text-white">{n.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">{n.message}</p>
                    <p className="text-[10px] text-[var(--color-muted)] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold shrink-0">
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