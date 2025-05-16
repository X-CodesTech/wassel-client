import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutGroup, motion } from "framer-motion";
import { List, DollarSign, FileText } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    {item.active && (
                      <motion.div
                        layoutId="sidebar-highlight"
                        className="absolute inset-0 bg-blue-50 rounded-md z-0"
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

      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}