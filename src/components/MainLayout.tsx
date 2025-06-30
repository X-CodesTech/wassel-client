import { useState } from "react";
import SideNav from "./SideNav";
import MainHeader from "./MainHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
    // Could redirect to login page or clear auth state
  };

  return (
    <div
      className={`grid grid-rows-[auto_1fr] h-screen overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "grid-cols-[4rem_1fr]" : "grid-cols-[16rem_1fr]"
      }`}
      style={{ overscrollBehavior: "none" }}
    >
      {/* Header spanning both columns */}
      <header className="col-span-2">
        <MainHeader onLogout={handleLogout} />
      </header>

      {/* Sidebar with hover scroll */}
      <aside
        className="bg-blue-600 overflow-y-auto min-h-0 shadow-lg"
        style={{ overscrollBehavior: "contain" }}
      >
        <SideNav
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main content area with hover scroll */}
      <main
        className="bg-gray-50 overflow-hidden hover:overflow-y-auto p-8"
        style={{ overscrollBehavior: "contain" }}
      >
        {children}
      </main>
    </div>
  );
}
