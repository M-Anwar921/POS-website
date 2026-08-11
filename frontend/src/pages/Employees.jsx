import { useEffect, useState } from "react";
import { FiPlus, FiUser, FiClock, FiCalendar, FiActivity } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import EmployeeFormModal from "../components/employees/EmployeeFormModal";
import EmployeeDetailModal from "../components/employees/EmployeeDetailModal";
import ActivityLogPanel from "../components/employees/ActivityLogPanel";

const tabs = [
  { id: "list", label: "Employees", icon: FiUser },
  { id: "activity", label: "Activity Log", icon: FiActivity },
];

export default function Employees() {
  const [tab, setTab] = useState("list");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.data);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tab === "list") fetchEmployees(); }, [tab]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Employees</h1>
        {tab === "list" && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
            <FiPlus size={14} /> Add Employee
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
              tab === t.id ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "activity" ? (
        <ActivityLogPanel />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : employees.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-10 text-sm">No employees yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map((e) => (
            <button
              key={e._id}
              onClick={() => setDetailId(e._id)}
              className="text-left bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
                  {e.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium dark:text-white">{e.user?.name}</p>
                  <p className="text-xs text-[var(--color-muted)] capitalize">{e.user?.role} · {e.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-muted)]">{e.position || "No position set"}</span>
                <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                  e.status === "active" ? "bg-emerald-100 text-[var(--color-success)]" :
                  e.status === "on_leave" ? "bg-amber-100 text-[var(--color-warning)]" : "bg-red-100 text-[var(--color-danger)]"
                }`}>
                  {e.status.replace("_", " ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && <EmployeeFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchEmployees(); }} />}
      {detailId && <EmployeeDetailModal employeeId={detailId} onClose={() => setDetailId(null)} onChanged={fetchEmployees} />}
    </div>
  );
}