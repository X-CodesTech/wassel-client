import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SORT_DIRECTIONS } from "@/constants/appConstants";
import { Activity } from "@/types/types";
import { ArrowUpDown } from "lucide-react";

type SortField = keyof Activity;
type SortDirection = (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS];

interface ActivityTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const COLUMN_CONFIG: Record<keyof Activity, string> = {
  _id: "ID",
  actSrl: "ACTsrl",
  activityCode: "Activity Code",
  activityTransactionType: "Activity Type",
  activityNameEn: "Activity Name (EN)",
  activityNameAr: "Activity Name (AR)",
  portalActivityNameEn: "Portal Activity Name (EN)",
  portalActivityNameAr: "Portal Activity Name (AR)",
  isWithItems: "With Items",
  isOpsActive: "Ops active",
  isPortalActive: "Portal active",
  isInOrderScreen: "In order screen",
  isInShippingUnit: "In shipping unit",
  isInSpecialRequirement: "In special requirement",
  isActive: "Active",
  createdAt: "Created At",
  updatedAt: "Updated At",
  subActivities: "Sub Activities",
} as const;

export function ActivityTableHeader({
  sortField,
  sortDirection,
  onSort,
}: ActivityTableHeaderProps) {
  const handleSort = (field: SortField) => {
    onSort(field);
  };

  return (
    <TableHeader className="bg-gray-50">
      <TableRow>
        {Object.entries(COLUMN_CONFIG).map(([field, label]) => (
          <TableHead
            key={field}
            onClick={() => handleSort(field as SortField)}
            className="cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              {label}
              <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
            </div>
          </TableHead>
        ))}
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
