import { useState } from "react";
import { SubActivity } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SortField = 'itmSrl' | 'itemCode' | 'itemName' | 'activityName' | 'activityType' | 'pricingMethod' | 'active';
type SortDirection = 'asc' | 'desc';

interface SubActivityTableProps {
  subActivities: SubActivity[];
  onEditSubActivity: (subActivity: SubActivity) => void;
  onDeleteSubActivity: (subActivity: SubActivity) => void;
  isLoading?: boolean;
}

export default function SubActivityTable({
  subActivities,
  onEditSubActivity,
  onDeleteSubActivity
}: SubActivityTableProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('itmSrl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeStatuses, setActiveStatuses] = useState<Record<number, boolean>>(() => {
    // Initialize with current active status
    const initialStatuses: Record<number, boolean> = {};
    subActivities.forEach(subActivity => {
      initialStatuses[subActivity.id] = subActivity.active;
    });
    return initialStatuses;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleSubActive = (id: number, active: boolean) => {
    // Update local state
    setActiveStatuses(prev => ({
      ...prev,
      [id]: active
    }));

    // Update the sub-activity's active status - in a real app, this would be part of a store
    const subActivity = subActivities.find(sa => sa.id === id);
    if (subActivity) {
      subActivity.active = active;
    }

    toast({
      title: `Sub-activity ${active ? 'activated' : 'deactivated'}`,
      description: "Sub-activity status has been updated successfully.",
    });
  };

  const sortedSubActivities = [...subActivities].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
      return sortDirection === 'asc'
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA);
    }

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }

    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc'
        ? fieldA - fieldB
        : fieldB - fieldA;
    }

    return 0;
  });

  return (
    <Table>
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead onClick={() => handleSort('itmSrl')} className="cursor-pointer">ITMsrl</TableHead>
          <TableHead onClick={() => handleSort('itemCode')} className="cursor-pointer">Item Code</TableHead>
          <TableHead onClick={() => handleSort('itemName')} className="cursor-pointer">Item Name</TableHead>
          <TableHead onClick={() => handleSort('activityName')} className="cursor-pointer">Activity Name</TableHead>
          <TableHead onClick={() => handleSort('activityType')} className="cursor-pointer">Activity type</TableHead>
          <TableHead onClick={() => handleSort('pricingMethod')} className="cursor-pointer">Pricing method</TableHead>
          <TableHead onClick={() => handleSort('active')} className="cursor-pointer">Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-gray-50">
        {subActivities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-gray-500">
              No sub-activities found. Add your first sub-activity using the button below.
            </TableCell>
          </TableRow>
        ) : (
          sortedSubActivities.map((subActivity) => (
            <TableRow key={subActivity.id} className="hover:bg-gray-100">
              <TableCell>{subActivity.itmSrl}</TableCell>
              <TableCell>{subActivity.itemCode}</TableCell>
              <TableCell>{subActivity.itemName}</TableCell>
              <TableCell>{subActivity.activityName}</TableCell>
              <TableCell>{subActivity.activityType}</TableCell>
              <TableCell>{subActivity.pricingMethod}</TableCell>
              <TableCell>
                <Switch
                  checked={activeStatuses[subActivity.id] ?? subActivity.active}
                  onCheckedChange={(checked) => handleToggleSubActive(subActivity.id, checked)}
                  className="scale-90"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="link"
                    className="text-indigo-600 hover:text-indigo-900 px-2 py-1 h-auto"
                    onClick={() => onEditSubActivity(subActivity)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    className="text-red-600 hover:text-red-900 px-2 py-1 h-auto"
                    onClick={() => onDeleteSubActivity(subActivity)}
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