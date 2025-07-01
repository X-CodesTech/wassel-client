import { useLocation } from "wouter";
import { LayoutGroup, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Palette,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils";

interface SideNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function SideNav({ collapsed, onToggleCollapse }: SideNavProps) {
  const [location, navigate] = useLocation();

  const mainItems = [
    {
      name: "Overview",
      href: "/",
      icon: <BarChart3 className="h-5 w-5" />,
      active: location === "/",
    },
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
      href: "/activities",
      icon: <Activity className="h-5 w-5" />,
      active: location === "/activities",
    },
    {
      name: "Type of transaction",
      href: "/transaction-types",
      icon: <FileText className="h-5 w-5" />,
      active: location === "/transaction-types",
    },
    {
      name: "Design System",
      href: "/design-system",
      icon: <Palette className="h-5 w-5" />,
      active: location === "/design-system",
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
    <TooltipProvider delayDuration={300}>
      <div className="h-full min-h-full flex flex-col">
        {/* Toggle Button - Fixed at top */}
        <div className="p-4 flex-shrink-0 flex justify-between items-center">
          {!collapsed && (
            <h2 className="text-white font-semibold text-lg">Menu</h2>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Create New Order Button */}
        <div className="p-4 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/create-order")}
                className={cn(
                  "w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium transition-colors flex items-center justify-center",
                  collapsed ? "py-3 px-2 rounded-sm" : "py-3 px-4 rounded-md"
                )}
              >
                <Plus className="h-5 w-5 text-gray-800" />
                {!collapsed && <span className="ml-2">Create new order</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Create new order</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 min-h-0">
          <LayoutGroup>
            {/* Main Navigation Items */}
            <ul className="space-y-0">
              {mainItems.map((item) => (
                <li key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => navigate(item.href)}
                        className={cn(
                          "flex items-center cursor-pointer relative transition-colors",
                          collapsed ? "px-3 py-4 justify-center" : "px-6 py-4",
                          "text-white font-medium",
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
                        <span
                          className={cn(
                            "z-10 flex items-center",
                            collapsed ? "justify-center" : ""
                          )}
                        >
                          {item.icon}
                          {!collapsed && (
                            <span className="ml-3">{item.name}</span>
                          )}
                        </span>
                      </div>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    )}
                  </Tooltip>
                </li>
              ))}
            </ul>

            {/* Settings Section */}
            <div className="mt-6">
              {!collapsed && (
                <div className="px-6 py-3">
                  <div className="flex items-center text-white font-medium">
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </div>
                </div>
              )}
              <ul className={cn("space-y-0", collapsed ? "" : "ml-6")}>
                {settingsItems.map((item) => (
                  <li key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => navigate(item.href)}
                          className={cn(
                            "flex items-center cursor-pointer relative transition-colors",
                            collapsed
                              ? "px-3 py-3 justify-center"
                              : "px-6 py-3",
                            "text-white",
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
                          <span
                            className={cn(
                              "z-10 flex items-center",
                              collapsed ? "justify-center" : ""
                            )}
                          >
                            {item.icon}
                            {!collapsed && (
                              <span className="ml-3">{item.name}</span>
                            )}
                          </span>
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Section */}
            <div className="mt-6">
              <ul className="space-y-0">
                {paymentItems.map((item) => (
                  <li key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => navigate(item.href)}
                          className={cn(
                            "flex items-center cursor-pointer relative transition-colors",
                            collapsed
                              ? "px-3 py-4 justify-center"
                              : "px-6 py-4",
                            "text-white font-medium",
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
                          <span
                            className={cn(
                              "z-10 flex items-center",
                              collapsed ? "justify-center" : ""
                            )}
                          >
                            {item.icon}
                            {!collapsed && (
                              <span className="ml-3">{item.name}</span>
                            )}
                          </span>
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </LayoutGroup>
        </nav>
      </div>
    </TooltipProvider>
  );
}
