import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";

const reportTabs = [
  { id: "sales", label: "Sales" },
  { id: "employee-sales", label: "Employee Sales" },
  { id: "inventory", label: "Inventory" },
  { id: "profit-loss", label: "Profit & Loss" },
  { id: "top-customers", label: "Top Customers" },
];

export default function Reports() {
  const [tab, setTab] = useState("sales");
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = `/reports/${tab}`;
    const params = ["sales", "employee-sales", "profit-loss"].includes(tab) ? { period } : {};
    api.get(endpoint, { params }).then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, [tab, period]);

  const handleExport = async () => {
    if (!["sales", "inventory", "profit-loss"].includes(tab)) {
      return toast.error("Export not available for this report type yet");
    }
    try {
      const res = await api.get("/reports/export", { params: { type: tab, period }, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${tab}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Reports</h1>
        <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {reportTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${tab === t.id ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {["sales", "employee-sales", "profit-loss"].includes(tab) && (
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mb-4 px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm dark:text-white">
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      )}

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
        ) : tab === "sales" && data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div><p className="text-lg font-bold dark:text-white">Rs {data.totalSales.toFixed(0)}</p><p className="text-xs text-[var(--color-muted)]">Total Sales</p></div>
              <div><p className="text-lg font-bold dark:text-white">{data.totalOrders}</p><p className="text-xs text-[var(--color-muted)]">Orders</p></div>
              <div><p className="text-lg font-bold dark:text-white">Rs {data.totalTax.toFixed(0)}</p><p className="text-xs text-[var(--color-muted)]">Tax Collected</p></div>
              <div><p className="text-lg font-bold dark:text-white">Rs {data.totalDiscount.toFixed(0)}</p><p className="text-xs text-[var(--color-muted)]">Discounts Given</p></div>
            </div>
          </div>
        ) : tab === "employee-sales" && data ? (
          <div className="space-y-2">
            {data.length === 0 ? <p className="text-sm text-[var(--color-muted)]">No sales in this period</p> : data.map((e, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                <span className="dark:text-white">{e.name} <span className="text-xs text-[var(--color-muted)] capitalize">({e.role})</span></span>
                <span className="text-[var(--color-muted)]">{e.orders} orders · Rs {e.sales.toFixed(0)}</span>
              </div>
            ))}
          </div>
        ) : tab === "inventory" && data ? (
          <div className="space-y-2">
            {data.map((p, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                <span className="dark:text-white">{p.name} <span className="text-xs text-[var(--color-muted)]">({p.sku})</span></span>
                <span className="text-[var(--color-muted)]">{p.stock} units · Rs {p.stockValue.toFixed(0)} value · {p.status}</span>
              </div>
            ))}
          </div>
        ) : tab === "profit-loss" && data ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2"><span className="dark:text-white">Revenue</span><span className="dark:text-white">Rs {data.revenue.toFixed(0)}</span></div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2"><span className="dark:text-white">Cost of Goods</span><span className="text-[var(--color-danger)]">-Rs {data.cogs.toFixed(0)}</span></div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2"><span className="dark:text-white">Gross Profit</span><span className="dark:text-white">Rs {data.grossProfit.toFixed(0)}</span></div>
            <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2"><span className="dark:text-white">Expenses</span><span className="text-[var(--color-danger)]">-Rs {data.totalExpenses.toFixed(0)}</span></div>
            <div className="col-span-2 flex justify-between font-bold text-base pt-1"><span className="dark:text-white">Net Profit</span><span className={data.netProfit >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>Rs {data.netProfit.toFixed(0)}</span></div>
          </div>
        ) : tab === "top-customers" && data ? (
          <div className="space-y-2">
            {data.length === 0 ? <p className="text-sm text-[var(--color-muted)]">No customer purchases yet</p> : data.map((c, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                <span className="dark:text-white">{c.name}</span>
                <span className="text-[var(--color-muted)]">{c.orders} orders · Rs {c.totalSpent.toFixed(0)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}