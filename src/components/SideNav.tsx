import { useLocation } from "wouter";
import { cn } from "@/utils";
import { LayoutGroup, motion } from "framer-motion";
import {
  Plus,
  List,
  Package,
  Settings,
  Users,
  DollarSign,
  Building2,
  MapPin,
  Activity,
  FileText,
  CreditCard,
  Receipt,
} from "lucide-react";

export default function SideNav() {
  const [location, navigate] = useLocation();

  const mainItems = [
    {
      name: "Order list",
      href: "/orders",
      icon: <List className="h-5 w-5" />,
      active: location === "/orders",
    },
    {
      name: "Shipments",
      href: "/shipments",
      icon: <Package className="h-5 w-5" />,
      active: location === "/shipments",
    },
    {
      name: "Shipment list",
      href: "/shipment-list",
      icon: <List className="h-5 w-5" />,
      active: location === "/shipment-list",
    },
  ];

  const settingsItems = [
    {
      name: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      active: location === "/users",
    },
    {
      name: "Pricelists",
      href: "/price-lists",
      icon: <DollarSign className="h-5 w-5" />,
      active: location === "/price-lists",
    },
    {
      name: "Vendor list",
      href: "/vendors",
      icon: <Building2 className="h-5 w-5" />,
      active: location === "/vendors",
    },
    {
      name: "Customer list",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
      active: location.startsWith("/customers"),
    },
    {
      name: "Locations",
      href: "/admin/locations",
      icon: <MapPin className="h-5 w-5" />,
      active: location.startsWith("/admin/locations"),
    },
    {
      name: "Activities",
      href: "/",
      icon: <Activity className="h-5 w-5" />,
      active: location === "/",
    },
    {
      name: "Type of transaction",
      href: "/transaction-types",
      icon: <FileText className="h-5 w-5" />,
      active: location === "/transaction-types",
    },
  ];

  const paymentItems = [
    {
      name: "Payment Requests",
      href: "/payment-requests",
      icon: <CreditCard className="h-5 w-5" />,
      active: location === "/payment-requests",
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: <Receipt className="h-5 w-5" />,
      active: location === "/invoices",
    },
  ];

  return (
    <div className="w-full bg-blue-600 shadow-lg h-full flex flex-col">
      {/* Create New Order Button - Fixed at top */}
      <div className="p-4 flex-shrink-0">
        <button
          onClick={() => navigate("/create-order")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create new order
        </button>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 min-h-full">
        <LayoutGroup>
          {/* Main Navigation Items */}
          <ul className="space-y-0">
            {mainItems.map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex items-center px-6 py-4 text-white font-medium cursor-pointer relative transition-colors",
                    item.active ? "bg-blue-700" : "hover:bg-blue-700"
                  )}
                >
                  {item.active && (
                    <motion.div
                      layoutId="sidebar-highlight"
                      className="absolute inset-0 bg-blue-700 z-0"
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

          {/* Settings Section */}
          <div className="mt-6">
            <div className="px-6 py-3">
              <div className="flex items-center text-white font-medium">
                <Settings className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </div>
            </div>
            <ul className="space-y-0 ml-6">
              {settingsItems.map((item) => (
                <li key={item.name}>
                  <div
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center px-6 py-3 text-white cursor-pointer relative transition-colors",
                      item.active ? "bg-blue-700" : "hover:bg-blue-700"
                    )}
                  >
                    {item.active && (
                      <motion.div
                        layoutId="settings-sidebar-highlight"
                        className="absolute inset-0 bg-blue-700 z-0"
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
          </div>

          {/* Payment Section */}
          <div className="mt-6">
            <ul className="space-y-0">
              {paymentItems.map((item) => (
                <li key={item.name}>
                  <div
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center px-6 py-4 text-white font-medium cursor-pointer relative transition-colors",
                      item.active ? "bg-blue-700" : "hover:bg-blue-700"
                    )}
                  >
                    {item.active && (
                      <motion.div
                        layoutId="payment-sidebar-highlight"
                        className="absolute inset-0 bg-blue-700 z-0"
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
          </div>
        </LayoutGroup>
      </nav>
    </div>
  );
}
