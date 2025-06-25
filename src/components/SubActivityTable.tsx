import { useState } from "react";
import { SubActivity } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  FINANCE_EFFECT_OPTIONS,
  PRICING_METHOD_OPTIONS,
} from "@/utils/constants";

type SortField =
  | "portalItemNameEn"
  | "portalItemNameAr"
  | "pricingMethod"
  | "financeEffect"
  | "transactionType"
  | "isUsedByFinance"
  | "isUsedByOps"
  | "isInShippingUnit"
  | "isInSpecialRequirement"
  | "isActive";
type SortDirection = "asc" | "desc";

interface SubActivityTableProps {
  subActivities: SubActivity[];
  isLoading?: boolean;
  onToggleSubActive: (id: string, active: boolean) => void;
  onDeleteSubActivity: (id: string) => void;
  onEditSubActivity: (id: string) => void;
}

const YesOrNoBadge = ({ value }: { value: boolean }) => {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
};

export default function SubActivityTable({
  subActivities,
  onToggleSubActive,
  onDeleteSubActivity,
  onEditSubActivity,
}: SubActivityTableProps) {
  const [sortField, setSortField] = useState<SortField>("portalItemNameEn");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSubActivities =
    subActivities?.length &&
    [...subActivities].sort((a, b) => {
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

      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
      }
      return 0;
    });

  return (
    <Table className="w-full">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead
            onClick={() => handleSort("portalItemNameEn")}
            className="cursor-pointer"
          >
            Portal Item Name (English)
          </TableHead>
          <TableHead
            onClick={() => handleSort("portalItemNameAr")}
            className="cursor-pointer"
          >
            Portal Item Name (Arabic)
          </TableHead>
          <TableHead
            onClick={() => handleSort("pricingMethod")}
            className="cursor-pointer"
          >
            Pricing Method
          </TableHead>
          <TableHead
            onClick={() => handleSort("financeEffect")}
            className="cursor-pointer"
          >
            Finance Effect
          </TableHead>
          <TableHead
            onClick={() => handleSort("transactionType")}
            className="cursor-pointer"
          >
            Transaction Type
          </TableHead>
          <TableHead
            onClick={() => handleSort("isUsedByFinance")}
            className="cursor-pointer"
          >
            Is Used By Finance
          </TableHead>
          <TableHead
            onClick={() => handleSort("isUsedByOps")}
            className="cursor-pointer"
          >
            Is Used By Ops
          </TableHead>
          <TableHead
            onClick={() => handleSort("isInShippingUnit")}
            className="cursor-pointer"
          >
            Is In Shipping Unit
          </TableHead>
          <TableHead
            onClick={() => handleSort("isInSpecialRequirement")}
            className="cursor-pointer"
          >
            Is In Special Requirement
          </TableHead>
          <TableHead
            onClick={() => handleSort("isActive")}
            className="cursor-pointer"
          >
            Active
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-gray-50">
        {subActivities?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-gray-500">
              No sub-activities found. Add your first sub-activity using the
              button below.
            </TableCell>
          </TableRow>
        ) : (
          sortedSubActivities &&
          sortedSubActivities?.map((subActivity: SubActivity) => (
            <TableRow key={subActivity._id} className="hover:bg-gray-100">
              <TableCell>{subActivity.portalItemNameEn}</TableCell>
              <TableCell>{subActivity.portalItemNameAr}</TableCell>
              <TableCell>
                {PRICING_METHOD_OPTIONS[subActivity.pricingMethod]}
              </TableCell>
              <TableCell>
                {FINANCE_EFFECT_OPTIONS[subActivity.financeEffect]}
              </TableCell>
              <TableCell>{subActivity.transactionType.name}</TableCell>
              <TableCell>
                <YesOrNoBadge value={subActivity.isUsedByFinance} />
              </TableCell>
              <TableCell>
                <YesOrNoBadge value={subActivity.isUsedByOps} />
              </TableCell>
              <TableCell>
                <YesOrNoBadge value={subActivity.isInShippingUnit} />
              </TableCell>
              <TableCell>
                <YesOrNoBadge value={subActivity.isInSpecialRequirement} />
              </TableCell>
              <TableCell>
                <Switch
                  checked={subActivity.isActive}
                  onCheckedChange={(checked) =>
                    onToggleSubActive(subActivity._id!, checked)
                  }
                  className="scale-90"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="link"
                    className="text-indigo-600 hover:text-indigo-900 px-2 py-1 h-auto"
                    onClick={() => onEditSubActivity(subActivity._id!)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    className="text-red-600 hover:text-red-900 px-2 py-1 h-auto"
                    onClick={() => onDeleteSubActivity(subActivity._id!)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
