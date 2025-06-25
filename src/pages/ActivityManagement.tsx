import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ActivityTable from "@/components/ActivityTable";
import AddActivityForm from "@/components/AddActivityForm";
import EditActivityForm from "@/components/EditActivityForm";
import SearchFilter from "@/components/SearchFilter";
import { Activity } from "@/types/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetActivities,
  actRemoveActivity,
} from "@/store/activities/activitiesSlice";
import { ActivitiesPageSkeleton } from "@/components/LoadingComponents";
import { ErrorComponent } from "@/components/ErrorComponents";
import { actGetTransactionTypes } from "@/store/transactionTypes/transactionTypesSlice";

export default function ActivityManagement() {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector(
    (state) => state.activities
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Modal states
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [editActivityOpen, setEditActivityOpen] = useState(false);
  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { toast } = useToast();

  // Delete activity function
  const deleteActivity = (id: string) => {
    dispatch(actRemoveActivity(id))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Sub-activity deleted successfully",
        });
        dispatch(actGetActivities());
      })
      .catch(() => {
        toast({
          title: "Failed",
          description: "An Erorr Occurred while deleting the Activity",
        });
      });
    setDeleteConfirmOpen(false);
  };

  // Filter activities based on search term and filter type
  const filteredActivities = records?.filter((activity: Activity) => {
    const matchesSearch =
      activity.actSrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityNameEn
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.activityNameAr
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.activityTransactionType
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!filterType) return matchesSearch;

    switch (filterType) {
      case "activityType":
        return matchesSearch && activity.activityTransactionType === "X-work";
      case "activeStatus":
        return matchesSearch && activity.isActive;
      default:
        return matchesSearch;
    }
  });

  // Toggle expanded activity
  const handleToggleExpand = (actSrl: string) => {
    setExpandedActivity(expandedActivity === actSrl ? null : actSrl);
  };

  // Handle edit activity
  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditActivityOpen(true);
  };

  // Handle delete activity
  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete activity
  const confirmDeleteActivity = () => {
    if (selectedActivity) {
      deleteActivity(selectedActivity._id!);
    }
  };

  // Handle add sub-activity
  const handleAddSubActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setAddSubActivityOpen(true);
  };

  useEffect(() => {
    dispatch(actGetActivities());
    dispatch(actGetTransactionTypes());
  }, [dispatch]);

  if (loading === "pending" && !records.length) {
    return <ActivitiesPageSkeleton />;
  }

  if (loading === "rejected" && error) {
    return (
      <div className="w-full h-full grid place-items-center">
        <ErrorComponent
          error={{
            type: "server",
            message: error,
          }}
        />
      </div>
    );
  }

  return (
    <main>
      <title>Activities Management | Wassel</title>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Activities Management
          </h2>
          <p className="text-gray-500 mt-2">
            Manage and organize activities and sub-activities in the system
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
                onAddActivity={() => setAddActivityOpen(true)}
              />
            </div>
          </div>

          <ActivityTable
            activities={filteredActivities}
            expandedActivity={expandedActivity}
            onToggleExpand={handleToggleExpand}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddSubActivity={handleAddSubActivity}
            handleAddSubActivityOpen={() => setAddSubActivityOpen(true)}
          />
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="max-w-[974px] w-full">
          <AddActivityForm onClose={() => setAddActivityOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityOpen} onOpenChange={setEditActivityOpen}>
        <DialogContent className="max-w-[974px] w-full">
          {selectedActivity && (
            <EditActivityForm
              activity={selectedActivity}
              onClose={() => setEditActivityOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Activity Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the activity and all its
              sub-activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteActivity}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
