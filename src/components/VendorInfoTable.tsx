import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vendor } from "@/types/types";
import { Building2 } from "lucide-react";
import { useMemo } from "react";

interface VendorInfoTableProps {
  vendor: Vendor;
  vendorDetails?: {
    description?: string;
    descriptionAr?: string;
  };
}

// Performance-optimized status configuration using Map
const VENDOR_STATUS_CONFIG = new Map([
  [
    true,
    {
      variant: "destructive" as const,
      label: "Blocked",
      className: undefined,
    },
  ],
  [
    false,
    {
      variant: "default" as const,
      label: "Active",
      className: "bg-green-100 text-green-800",
    },
  ],
]);

// Field configurations using Map for O(1) lookups
const FIELD_CONFIGS = new Map<
  string,
  { isBold?: boolean; isSpecial?: boolean }
>([
  ["vendorname", { isBold: true }],
  ["status", { isSpecial: true }],
]);

export default function VendorInfoTable({
  vendor,
  vendorDetails,
}: VendorInfoTableProps) {
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (blocked: boolean): React.ReactNode => {
    const config = VENDOR_STATUS_CONFIG.get(blocked);
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Generate field data as 2D array for efficient rendering
  const fieldData = useMemo(
    () =>
      [
        [
          ["Vendor ID", vendor._id],
          ["Vendor Name", vendor.vendName],
        ],
        [
          ["Vendor Account", vendor.vendAccount],
          ["Vendor Group ID", vendor.vendGroupId],
        ],
        [
          ["Description", vendorDetails?.description || "N/A"],
          ["Description (Ar)", vendorDetails?.descriptionAr || "N/A"],
        ],
        [
          ["Last Updated", formatDate(vendor.updatedAt)],
          ["Created Date", formatDate(vendor.createdDate)],
        ],
      ] as [string, string | React.ReactNode][][],
    [vendor, vendorDetails?.description, vendorDetails?.descriptionAr]
  );

  const renderInfoRow = ([label, value]: [
    string,
    string | React.ReactNode
  ]): React.ReactNode => {
    const key = label.toLowerCase().replace(/\s+/g, "") as string;
    const config = FIELD_CONFIGS.get(key);

    return (
      <div
        key={label}
        className={`flex justify-between ${
          config?.isSpecial ? "items-center" : ""
        }`}
      >
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <span className={`text-sm ${config?.isBold ? "font-semibold" : ""}`}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            <p className="text-lg font-semibold">Vendor Info</p>
          </div>
          <div>{getStatusBadge(vendor.blocked)}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fieldData.map((row, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {row.map(renderInfoRow)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
