import { Customer } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemo } from "react";
import { Badge } from "../ui/badge";
import { Building2 } from "lucide-react";

const CUSTOMER_STATUS_CONFIG = new Map([
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
  ["custname", { isBold: true }],
  ["blocked", { isSpecial: true }],
]);

const getStatusBadge = (blocked: boolean): React.ReactNode => {
  const config = CUSTOMER_STATUS_CONFIG.get(blocked);
  if (!config) return null;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const CustomerInfoTable = ({ customer }: { customer: Customer }) => {
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const fieldData = useMemo(
    () =>
      [
        [
          ["Customer Name", customer?.custName],
          ["Customer ID", customer?._id],
        ],
        [
          ["Customer Account", customer?.custAccount],
          ["Created Date", formatDate(customer?.createdDate)],
        ],
        [
          ["Last Updated", formatDate(customer?.updatedAt)],
          ["Customer Group ID", customer?.companyChainId],
        ],
      ] as [string, string | React.ReactNode][][],
    [customer]
  );

  const renderInfoRow = ([label, value]: [
    string,
    string | React.ReactNode
  ]): React.ReactNode => {
    const key =
      typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "") : "";
    const config = FIELD_CONFIGS.get(key);

    if (value === undefined || value === null || value === "") return null;

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
            <p className="text-lg font-semibold">Customer Info</p>
          </div>
          <div>{getStatusBadge(customer?.blocked)}</div>
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
};

export default CustomerInfoTable;
