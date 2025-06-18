import { Activity, SubActivity } from "@/types/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import SubActivityTable from "@/components/SubActivityTable";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actUpdateActivity } from "@/store/activities/act/actUpdateActivity";
import { actGetActivities } from "@/store/activities/activitiesSlice";
import { set } from "date-fns";
import { subActivityServices } from "@/services";

interface ActivityRowProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpand: (actSrl: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onAddSubActivity: (activity: Activity) => void;
  onEditSubActivity: (subActivity: SubActivity) => void;
  onDeleteSubActivity: (subActivity: SubActivity) => void;
  subActivities?: SubActivity[];
}

export default function ActivityRow({
  activity,
  isExpanded,
  onToggleExpand,
  onEditActivity,
  onDeleteActivity,
  onAddSubActivity,
  onEditSubActivity,
  onDeleteSubActivity,
  subActivities = [],
}: ActivityRowProps) {
  const dispatch = useAppDispatch();
  const [subActivitiesLoading, setSubActivitiesLoading] = useState(false);
  const [subActivityRecords, setSubActivityRecords] = useState([]);
  const { records } = useAppSelector((state) => state.transactionTypes);
  const { loading } = useAppSelector((state) => state.activities);

  const { toast } = useToast();

  // Handle toggle active status client-side
  const handleToggleActive = (isActive: boolean) => {
    dispatch(
      actUpdateActivity({ ...activity, _id: activity._id, isActive: isActive })
    )
      .unwrap()
      .then(() => {
        dispatch(actGetActivities());
        toast({
          title: `Activity ${isActive ? "activated" : "deactivated"}`,
          description: `${activity.activityNameEn} has been ${
            isActive ? "activated" : "deactivated"
          }.`,
        });
      })
      .catch((error) => {
        console.error("Failed to update activity status:", error);
        toast({
          title: "Error",
          description: "Failed to update activity status. Please try again.",
          variant: "destructive",
        });
      });
  };

  const getSubActivities = async () => {
    setSubActivitiesLoading(true);
    try {
      const { data } = await subActivityServices.getSubActivityByActivityId(
        activity._id!
      );
      setSubActivityRecords(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sub-activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubActivitiesLoading(false);
    }
  };

  useEffect(() => {
    getSubActivities();
  }, []);

  return (
    <>
      <TableRow className="hover:bg-gray-50 cursor-pointer">
        <TableCell>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => onToggleExpand(activity.actSrl)}
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 text-primary transition-transform duration-200",
                isExpanded && "transform rotate-90"
              )}
            />
            <span>{activity.actSrl}</span>
          </button>
        </TableCell>
        <TableCell>{activity.activityCode}</TableCell>
        <TableCell>
          {
            records.find(
              (transactionType) =>
                transactionType._id === activity.activityTransactionType
            )?.name
          }
        </TableCell>
        <TableCell>{activity.activityNameEn}</TableCell>
        <TableCell>{activity.activityNameAr}</TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isWithItems
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {activity.isWithItems ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isOpsActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {activity.isOpsActive ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isPortalActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {activity.isPortalActive ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isInOrderScreen
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {activity.isInOrderScreen ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isInShippingUnit
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {activity.isInShippingUnit ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              activity.isInSpecialRequirement
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {activity.isInSpecialRequirement ? "Yes" : "No"}
          </span>
        </TableCell>
        <TableCell>
          <Switch
            checked={activity.isActive}
            disabled={loading === "pending"}
            onCheckedChange={handleToggleActive}
            aria-label="Toggle activity status"
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button
              variant="link"
              className="text-indigo-600 hover:text-indigo-900"
              onClick={(e) => {
                e.stopPropagation();
                onEditActivity(activity);
              }}
            >
              Edit
            </Button>
            <Button
              variant="link"
              className="text-red-600 hover:text-red-900"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteActivity(activity);
              }}
            >
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-gray-50">
          <TableCell colSpan={8} className="px-0 py-0">
            <div className="px-4 py-2">
              <SubActivityTable
                subActivities={subActivityRecords}
                onEditSubActivity={onEditSubActivity}
                onDeleteSubActivity={onDeleteSubActivity}
              />
              <div className="mt-3 ml-6">
                {activity.isWithItems ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-transparent"
                    onClick={() => onAddSubActivity(activity)}
                  >
                    <svg
                      className="-ml-0.5 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Sub-Activity
                  </Button>
                ) : (
                  <span className="text-gray-500 text-sm italic">
                    Sub-activities not available (isWithItems is set to No)
                  </span>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
