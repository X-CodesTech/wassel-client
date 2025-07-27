import { useState, useEffect } from "react";
import SideNav from "./SideNav";
import MainHeader from "./MainHeader";

const SIDEBAR_STORAGE_KEY = "sidebar_isExpanded";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state from localStorage, defaulting to true (expanded)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? !JSON.parse(stored) : false;
    } catch (error) {
      console.warn("Failed to read sidebar state from localStorage:", error);
      return false;
    }
  });

  // Update localStorage when sidebar state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        JSON.stringify(!sidebarCollapsed)
      );
    } catch (error) {
      console.warn("Failed to save sidebar state to localStorage:", error);
    }
  }, [sidebarCollapsed]);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
          onToggleCollapse={handleToggleCollapse}
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
