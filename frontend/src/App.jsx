import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Categories from "./pages/Categories";

// Placeholder pages — Phase 3-5 will replace these
const Placeholder = ({ title }) => (
  <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-8 shadow-sm">
    <h1 className="text-xl font-semibold dark:text-white">{title}</h1>
    <p className="text-sm text-[var(--color-muted)] mt-2">This module is coming in a later phase.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Placeholder title="Inventory" />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Placeholder title="Customers" />} />
          <Route path="/suppliers" element={<Placeholder title="Suppliers" />} />
          <Route path="/purchases" element={<Placeholder title="Purchases" />} />
          <Route path="/orders" element={<Placeholder title="Orders" />} />
          <Route path="/returns" element={<Placeholder title="Returns" />} />
          <Route path="/expenses" element={<Placeholder title="Expenses" />} />
          <Route path="/reports" element={<Placeholder title="Reports" />} />
          <Route path="/employees" element={<Placeholder title="Employees" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}