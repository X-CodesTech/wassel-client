import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutGroup, motion } from "framer-motion";
import { List, DollarSign, FileText, MapPin } from "lucide-react";

export default function SideNav() {
  const [location, navigate] = useLocation();

  const navItems = [
    {
      name: "Activities",
      href: "/",
      icon: <List className="h-5 w-5" />,
      active: location === "/"
    },
    {
      name: "Price Lists",
      href: "/price-lists",
      icon: <DollarSign className="h-5 w-5" />,
      active: location === "/price-lists"
    },
    {
      name: "Transaction Types",
      href: "/transaction-types",
      icon: <FileText className="h-5 w-5" />,
      active: location === "/transaction-types"
    },
    {
      name: "Locations",
      href: "/admin/locations",
      icon: <MapPin className="h-5 w-5" />,
      active: location.startsWith("/admin/locations")
    }
  ];

  const adminItems = [
    {
      name: "Locations",
      href: "/admin/locations",
      icon: <MapPin className="h-5 w-5" />,
      active: location.startsWith("/admin/locations")
    }
  ];

  return (
    <div className="w-64 shadow-sm" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold" style={{
          background: 'linear-gradient(to right, #1e88e5, #3949ab)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          FMS System
        </h1>
      </div>
      <nav className="mt-6 px-4">
        <LayoutGroup>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md relative cursor-pointer",
                    item.active
                      ? "text-[#1e88e5]"
                      : "text-gray-600 hover:text-[#1e88e5] hover:bg-[#f0f7ff]"
                  )}
                >
                  {item.active && (
                    <motion.div
                      layoutId="sidebar-highlight"
                      className="absolute inset-0 rounded-md z-0"
                      style={{ backgroundColor: '#e3f2fd' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className="z-10 flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>

        </LayoutGroup>
      </nav>
    </div>
  );
}