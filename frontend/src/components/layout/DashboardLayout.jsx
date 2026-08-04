import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { MobileSidebar } from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] min-h-screen">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}