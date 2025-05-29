import SideNav from "./SideNav";
import MainHeader from "./MainHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
    // Could redirect to login page or clear auth state
  };

  return (
    <div
      className="grid grid-rows-[auto_1fr] grid-cols-[16rem_1fr] h-screen overflow-hidden"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Header spanning both columns */}
      <header className="col-span-2">
        <MainHeader onLogout={handleLogout} />
      </header>

      {/* Sidebar with hover scroll */}
      <aside
        className="bg-blue-600 overflow-y-auto min-h-0"
        style={{ overscrollBehavior: "contain" }}
      >
        <SideNav />
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
