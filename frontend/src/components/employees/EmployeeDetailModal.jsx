import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiClock, FiCalendar, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

const tabs = ["Overview", "Attendance", "Shifts", "Salary"];

export default function EmployeeDetailModal({ employeeId, onClose, onChanged }) {
  const [employee, setEmployee] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [attendance, setAttendance] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [shiftForm, setShiftForm] = useState({ date: "", startTime: "09:00", endTime: "17:00", role: "" });
  const [salaryForm, setSalaryForm] = useState({ amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const fetchAll = async () => {
    const [empRes, perfRes] = await Promise.all([
      api.get(`/employees/${employeeId}`),
      api.get(`/employees/${employeeId}/performance`),
    ]);
    setEmployee(empRes.data.data);
    setPerformance(perfRes.data.data);
  };

  useEffect(() => { fetchAll(); }, [employeeId]);

  useEffect(() => {
    if (tab === "Attendance") api.get("/attendance", { params: { employee: employeeId } }).then((res) => setAttendance(res.data.data));
    if (tab === "Shifts") api.get("/shifts", { params: { employee: employeeId } }).then((res) => setShifts(res.data.data));
    if (tab === "Salary") api.get("/salary", { params: { employee: employeeId } }).then((res) => setPayments(res.data.data));
  }, [tab, employeeId]);

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shifts", { ...shiftForm, employee: employeeId });
      toast.success("Shift scheduled");
      const res = await api.get("/shifts", { params: { employee: employeeId } });
      setShifts(res.data.data);
      setShiftForm({ date: "", startTime: "09:00", endTime: "17:00", role: "" });
    } catch {
      toast.error("Failed to schedule shift");
    }
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    try {
      await api.post("/salary", { ...salaryForm, employee: employeeId, amount: Number(salaryForm.amount) });
      toast.success("Salary payment recorded");
      const res = await api.get("/salary", { params: { employee: employeeId } });
      setPayments(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold dark:text-white">{employee.user?.name}</h3>
            <p className="text-xs text-[var(--color-muted)] capitalize">{employee.user?.role} · {employee.employeeId}</p>
          </div>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === t ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-muted)]"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto">
          {tab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold dark:text-white">{performance?.orderCount || 0}</p>
                  <p className="text-xs text-[var(--color-muted)]">Sales (mo.)</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold dark:text-white">Rs {(performance?.totalSales || 0).toFixed(0)}</p>
                  <p className="text-xs text-[var(--color-muted)]">Revenue</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold dark:text-white">Rs {(performance?.avgOrderValue || 0).toFixed(0)}</p>
                  <p className="text-xs text-[var(--color-muted)]">Avg Order</p>
                </div>
              </div>
              <div className="text-sm space-y-1.5">
                <p className="dark:text-white"><span className="text-[var(--color-muted)]">Department:</span> {employee.department || "—"}</p>
                <p className="dark:text-white"><span className="text-[var(--color-muted)]">Position:</span> {employee.position || "—"}</p>
                <p className="dark:text-white"><span className="text-[var(--color-muted)]">Base Salary:</span> Rs {employee.baseSalary.toFixed(0)}</p>
                <p className="dark:text-white"><span className="text-[var(--color-muted)]">Hired:</span> {new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {tab === "Attendance" && (
            <div className="space-y-2">
              {attendance.length === 0 ? <p className="text-xs text-[var(--color-muted)]">No attendance records yet</p> : (
                attendance.map((a) => (
                  <div key={a._id} className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-800/50 pb-1.5">
                    <span className="dark:text-white">{new Date(a.date).toLocaleDateString()}</span>
                    <span className="capitalize text-[var(--color-muted)]">{a.status}</span>
                    <span className="text-[var(--color-muted)]">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      {" → "}
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Shifts" && (
            <div className="space-y-3">
              <form onSubmit={handleAddShift} className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <input required type="date" value={shiftForm.date} onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <input placeholder="Role" value={shiftForm.role} onChange={(e) => setShiftForm({ ...shiftForm, role: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <button type="submit" className="col-span-2 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white">Schedule Shift</button>
              </form>
              <div className="space-y-2">
                {shifts.length === 0 ? <p className="text-xs text-[var(--color-muted)]">No shifts scheduled</p> : (
                  shifts.map((s) => (
                    <div key={s._id} className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-800/50 pb-1.5">
                      <span className="dark:text-white">{new Date(s.date).toLocaleDateString()}</span>
                      <span className="text-[var(--color-muted)]">{s.startTime} - {s.endTime}</span>
                      <span className="text-[var(--color-muted)]">{s.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "Salary" && (
            <div className="space-y-3">
              <form onSubmit={handlePaySalary} className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <input required type="number" placeholder="Amount" value={salaryForm.amount} onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <select value={salaryForm.month} onChange={(e) => setSalaryForm({ ...salaryForm, month: Number(e.target.value) })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white">
                  {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "short" })}</option>)}
                </select>
                <input type="number" value={salaryForm.year} onChange={(e) => setSalaryForm({ ...salaryForm, year: Number(e.target.value) })} className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-xs dark:text-white" />
                <button type="submit" className="col-span-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white">Record Payment</button>
              </form>
              <div className="space-y-2">
                {payments.length === 0 ? <p className="text-xs text-[var(--color-muted)]">No salary payments recorded</p> : (
                  payments.map((p) => (
                    <div key={p._id} className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-800/50 pb-1.5">
                      <span className="dark:text-white">{new Date(2000, p.month - 1).toLocaleString("default", { month: "short" })} {p.year}</span>
                      <span className="font-medium dark:text-white">Rs {p.amount.toFixed(0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}