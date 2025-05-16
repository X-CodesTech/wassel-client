import { useState } from "react";
import { SubActivity } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SortField = 'itmSrl' | 'itemCode' | 'itemName' | 'activityName' | 'activityType' | 'pricingMethod' | 'active';
type SortDirection = 'asc' | 'desc';

interface SubActivityTableProps {
  subActivities: SubActivity[];
  isLoading: boolean;
  onEditSubActivity: (subActivity: SubActivity) => void;
  onDeleteSubActivity: (subActivity: SubActivity) => void;
}

export default function SubActivityTable({
  subActivities,
  isLoading,
  onEditSubActivity,
  onDeleteSubActivity
}: SubActivityTableProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('itmSrl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Toggle sub-activity active status mutation
  const toggleSubActiveStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await apiRequest("PUT", `/api/subactivities/${id}`, { active });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: `Sub-activity ${variables.active ? 'activated' : 'deactivated'}`,
        description: "Sub-activity status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update sub-activity status: ${error}`,
        variant: "destructive"
      });
    }
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
    toggleSubActiveStatusMutation.mutate({ id, active });
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

  if (isLoading) {
    return (
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>ITMsrl</TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Activity Name</TableHead>
            <TableHead>Activity type</TableHead>
            <TableHead>Pricing method</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-gray-50">
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-10" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

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
                  checked={subActivity.active} 
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
