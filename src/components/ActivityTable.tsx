import { useState } from "react";
import { Activity, SubActivity } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import ActivityRow from "@/components/ActivityRow";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SortField = 'actSrl' | 'activityCode' | 'activityType' | 'activityName' | 'isWithItems' | 'financeEffect' | 'active';
type SortDirection = 'asc' | 'desc';

interface ActivityTableProps {
  activities: Activity[];
  expandedActivity: string | null;
  isLoading: boolean;
  onToggleExpand: (actSrl: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onAddSubActivity: (activity: Activity) => void;
  onEditSubActivity: (subActivity: SubActivity) => void;
  onDeleteSubActivity: (subActivity: SubActivity) => void;
}

export default function ActivityTable({
  activities,
  expandedActivity,
  isLoading,
  onToggleExpand,
  onEditActivity,
  onDeleteActivity,
  onAddSubActivity,
  onEditSubActivity,
  onDeleteSubActivity
}: ActivityTableProps) {
  const [sortField, setSortField] = useState<SortField>('actSrl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
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

    return 0;
  });

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ACTsrl</TableHead>
              <TableHead>Activity Code</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>Activity Name</TableHead>
              <TableHead>Is with Items</TableHead>
              <TableHead>Finance Effect</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead onClick={() => handleSort('actSrl')} className="cursor-pointer">
              <div className="flex items-center">
                ACTsrl
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('activityCode')} className="cursor-pointer">
              <div className="flex items-center">
                Activity Code
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('activityType')} className="cursor-pointer">
              <div className="flex items-center">
                Activity Type
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('activityName')} className="cursor-pointer">
              <div className="flex items-center">
                Activity Name
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('isWithItems')} className="cursor-pointer">
              <div className="flex items-center">
                Is with Items
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('financeEffect')} className="cursor-pointer">
              <div className="flex items-center">
                Finance Effect
                <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('active')} className="cursor-pointer">
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
                key={activity.id}
                activity={activity}
                isExpanded={expandedActivity === activity.actSrl}
                onToggleExpand={onToggleExpand}
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
                onAddSubActivity={onAddSubActivity}
                onEditSubActivity={onEditSubActivity}
                onDeleteSubActivity={onDeleteSubActivity}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
