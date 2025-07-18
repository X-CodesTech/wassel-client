import ActivityRow from "@/components/ActivityRow";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  ACTIVITY_TABLE_COLUMNS,
  SORT_DIRECTIONS,
} from "@/constants/appConstants";
import { Activity } from "@/types/types";
import { SortDirection, SortUtils } from "@/utils/sortUtils";
import { useState } from "react";
import { ActivityTableHeader } from "./ActivityTableHeader";

type SortField = keyof Activity;

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
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({
    field: "actSrl",
    direction: SORT_DIRECTIONS.ASC,
  });

  const handleSort = (field: SortField) => {
    const newConfig = SortUtils.getNextSortConfig(
      sortConfig.field,
      sortConfig.direction,
      field
    );
    setSortConfig(newConfig);
  };

  const sortedActivities = SortUtils.sort(activities, sortConfig);

  return (
    <div className="overflow-x-auto">
      <Table>
        <ActivityTableHeader
          sortField={sortConfig.field}
          sortDirection={sortConfig.direction}
          onSort={handleSort}
        />
        <TableBody>
          {sortedActivities.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={Object.keys(ACTIVITY_TABLE_COLUMNS).length + 1}
                className="text-center py-8 text-gray-500"
              >
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
