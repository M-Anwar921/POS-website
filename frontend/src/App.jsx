import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Orders from "./pages/Orders";
import Returns from "./pages/Returns";
import Customers from "./pages/Customers";
import Expenses from "./pages/Expenses";
import Employees from "./pages/Employees";

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
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Placeholder title="Reports" />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/returns" element={<Returns />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}