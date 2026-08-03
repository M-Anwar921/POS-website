import { NavLink } from "react-router-dom";
import {
  FiGrid, FiShoppingCart, FiBox, FiLayers, FiTag, FiUsers, FiTruck,
  FiShoppingBag, FiClipboard, FiRotateCcw, FiDollarSign, FiBarChart2,
  FiUserCheck, FiSettings, FiLogOut,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/pos", label: "POS", icon: FiShoppingCart },
  { to: "/products", label: "Products", icon: FiBox },
  { to: "/inventory", label: "Inventory", icon: FiLayers },
  { to: "/categories", label: "Categories", icon: FiTag },
  { to: "/customers", label: "Customers", icon: FiUsers },
  { to: "/suppliers", label: "Suppliers", icon: FiTruck },
  { to: "/purchases", label: "Purchases", icon: FiShoppingBag },
  { to: "/orders", label: "Orders", icon: FiClipboard },
  { to: "/returns", label: "Returns", icon: FiRotateCcw },
  { to: "/expenses", label: "Expenses", icon: FiDollarSign },
  { to: "/reports", label: "Reports", icon: FiBarChart2 },
  { to: "/employees", label: "Employees", icon: FiUserCheck },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[var(--color-card-dark)] border-r border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">P</div>
        <span className="font-semibold text-lg dark:text-white">POS Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-muted)] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}