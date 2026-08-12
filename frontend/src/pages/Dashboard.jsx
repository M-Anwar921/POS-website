import { useEffect, useState } from "react";
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../api/axios";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between mb-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon style={{ color }} size={16} />
      </div>
    </div>
    <p className="text-xl font-bold dark:text-white">{value}</p>
    <p className="text-xs text-[var(--color-muted)]">{label}</p>
  </div>
);

const inventoryColors = ["#10B981", "#F59E0B", "#EF4444"];

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);

  useEffect(() => {
    api.get("/dashboard/overview").then((res) => setOverview(res.data.data));
    api.get("/dashboard/top-products").then((res) => setTopProducts(res.data.data));
    api.get("/dashboard/recent-transactions").then((res) => setTransactions(res.data.data));
    api.get("/dashboard/sales-chart", { params: { days: 7 } }).then((res) => setSalesChart(res.data.data));
    api.get("/dashboard/inventory-status").then((res) => setInventoryStatus(res.data.data));
  }, []);

  const pieData = inventoryStatus ? [
    { name: "In Stock", value: inventoryStatus.inStock },
    { name: "Low Stock", value: inventoryStatus.lowStock },
    { name: "Out of Stock", value: inventoryStatus.outOfStock },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FiDollarSign} label="Today's Sales" value={`Rs ${(overview?.todaySales || 0).toFixed(0)}`} color="#2563EB" />
        <StatCard icon={FiShoppingBag} label="Today's Orders" value={overview?.todayOrders || 0} color="#10B981" />
        <StatCard icon={FiTrendingUp} label="Monthly Revenue" value={`Rs ${(overview?.monthRevenue || 0).toFixed(0)}`} color="#F59E0B" />
        <StatCard icon={FiUsers} label="Total Customers" value={overview?.totalCustomers || 0} color="#8B5CF6" />
        <StatCard icon={FiPackage} label="Products Sold Today" value={overview?.productsSoldToday || 0} color="#06B6D4" />
        <StatCard icon={FiAlertTriangle} label="Low Stock Items" value={overview?.lowStock || 0} color="#F59E0B" />
        <StatCard icon={FiDollarSign} label="Est. Profit (mo.)" value={`Rs ${(overview?.profit || 0).toFixed(0)}`} color="#10B981" />
        <StatCard icon={FiDollarSign} label="Expenses (mo.)" value={`Rs ${(overview?.totalExpenses || 0).toFixed(0)}`} color="#EF4444" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold dark:text-white mb-3">Sales — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesChart}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold dark:text-white mb-3">Inventory Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {pieData.map((_, i) => <Cell key={i} fill={inventoryColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-2 text-xs">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 dark:text-white">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inventoryColors[i] }} /> {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold dark:text-white mb-3">Top Selling Products (mo.)</h3>
          <div className="space-y-2">
            {topProducts.length === 0 ? <p className="text-xs text-[var(--color-muted)]">No sales yet this month</p> : (
              topProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="dark:text-white">{p.name}</span>
                  <span className="text-[var(--color-muted)]">{p.quantity} sold · Rs {p.revenue.toFixed(0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold dark:text-white mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? <p className="text-xs text-[var(--color-muted)]">No transactions yet</p> : (
              transactions.map((t) => (
                <div key={t._id} className="flex justify-between text-sm">
                  <span className="dark:text-white">{t.orderNumber}</span>
                  <span className="text-[var(--color-muted)]">Rs {t.grandTotal.toFixed(0)} · {t.customer?.name || "Walk-in"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}