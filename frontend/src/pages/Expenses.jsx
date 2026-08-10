import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiTrash2, FiDollarSign } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import ExpenseFormModal from "../components/expenses/ExpenseFormModal";

const categoryColors = {
  Utilities: "#2563EB", Rent: "#F59E0B", Salary: "#10B981", Transportation: "#8B5CF6",
  Marketing: "#EC4899", Maintenance: "#06B6D4", Other: "#6B7280",
};

export default function Expenses() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, reportRes] = await Promise.all([
        api.get("/expenses", { params: { month, year, limit: 50 } }),
        api.get("/expenses/report", { params: { month, year } }),
      ]);
      setExpenses(expRes.data.data);
      setReport(reportRes.data.data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Expenses</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiPlus size={14} /> Add Expense
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm dark:text-white">
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "long" })}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm dark:text-white">
          {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {report && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-[var(--color-muted)] mb-1">Total Expenses This Month</p>
            <p className="text-2xl font-bold dark:text-white">Rs {report.total.toFixed(0)}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">{report.count} entries</p>
          </div>
          <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-[var(--color-muted)] mb-2">By Category</p>
            <div className="space-y-1.5">
              {report.byCategory.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">No expenses recorded</p>
              ) : (
                report.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 dark:text-white">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[c.category] || categoryColors.Other }} />
                      {c.category}
                    </span>
                    <span className="font-medium dark:text-white">Rs {c.amount.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>)
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-[var(--color-muted)]">No expenses for this month</td></tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${categoryColors[e.category] || categoryColors.Other}20`, color: categoryColors[e.category] || categoryColors.Other }}>
                        {e.category === "Other" && e.customCategory ? e.customCategory : e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{e.description || "—"}</td>
                    <td className="px-4 py-3 dark:text-white">Rs {e.amount.toFixed(0)}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(e._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-danger)]">
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ExpenseFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchData(); }} />}
    </div>
  );
}