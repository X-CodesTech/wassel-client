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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainHeader onLogout={handleLogout} />

      {/* Main layout with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <SideNav />

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}
