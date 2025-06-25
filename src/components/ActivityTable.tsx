import { useState } from "react";
import { Activity, SubActivity } from "@/types/types";
import ActivityRow from "@/components/ActivityRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

type SortField =
  | "actSrl"
  | "activityCode"
  | "activityNameAr"
  | "activityNameEn"
  | "activityTransactionType"
  | "isActive"
  | "isInOrderScreen"
  | "isInShippingUnit"
  | "isInSpecialRequirement"
  | "isOpsActive"
  | "isWithItems"
  | "portalActivityNameAr"
  | "portalActivityNameEn"
  | "isPortalActive";
type SortDirection = "asc" | "desc";

interface ActivityTableProps {
  activities: Activity[];
  expandedActivity: string | null;
  onToggleExpand: (actSrl: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onAddSubActivity: (activity: Activity) => void;
  handleAddSubActivityOpen: () => void;
}

export default function ActivityTable({
  activities,
  expandedActivity,
  onToggleExpand,
  onEditActivity,
  onDeleteActivity,
  onAddSubActivity,
  handleAddSubActivityOpen,
}: ActivityTableProps) {
  const [sortField, setSortField] = useState<SortField>("actSrl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
      return sortDirection === "asc"
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA);
    }

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }

    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead
              onClick={() => handleSort("actSrl")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                ACTsrl
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("activityCode")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Activity Code
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("activityTransactionType")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Activity Type
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("activityNameEn")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Activity Name (EN)
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("activityNameAr")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Activity Name (AR)
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isWithItems")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                With Items
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isOpsActive")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Ops active
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isPortalActive")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Portal active
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isInOrderScreen")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                In order screen
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isInShippingUnit")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                In shipping unit
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isInSpecialRequirement")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                In special requirement
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("isActive")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Active
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActivities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No activities found. Add your first activity to get started.
              </TableCell>
            </TableRow>
          ) : (
            sortedActivities.map((activity) => (
              <ActivityRow
                key={activity._id}
                activity={activity}
                isExpanded={expandedActivity === activity.actSrl}
                onToggleExpand={onToggleExpand}
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
