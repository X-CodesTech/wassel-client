import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ActivityTable from "@/components/ActivityTable";
import AddActivityForm from "@/components/AddActivityForm";
import EditActivityForm from "@/components/EditActivityForm";
import AddSubActivityForm from "@/components/AddSubActivityForm";
import EditSubActivityForm from "@/components/EditSubActivityForm";
import SearchFilter from "@/components/SearchFilter";
import { Activity, SubActivity } from "@/types/types";
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

export default function ActivityManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedSubActivity, setSelectedSubActivity] =
    useState<SubActivity | null>(null);

  // Modal states
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [editActivityOpen, setEditActivityOpen] = useState(false);
  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);
  const [editSubActivityOpen, setEditSubActivityOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubConfirmOpen, setDeleteSubConfirmOpen] = useState(false);

  const { toast } = useToast();

  // Sample client-side activities data
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      actSrl: "X01",
      activityCode: "PKGN",
      activityType: "X-work",
      activityName: "Packaging",
      isWithItems: true,
      financeEffect: "Positive Effect",
      active: true,
    },
    {
      id: 2,
      actSrl: "I01",
      activityCode: "INSR",
      activityType: "Service",
      activityName: "Insurance",
      isWithItems: true,
      financeEffect: "No Effect",
      active: true,
    },
    {
      id: 3,
      actSrl: "M01",
      activityCode: "MATL",
      activityType: "Material",
      activityName: "Material Handling",
      isWithItems: true,
      financeEffect: "Positive Effect",
      active: true,
    },
    {
      id: 4,
      actSrl: "T01",
      activityCode: "TRNS",
      activityType: "Transport",
      activityName: "Transportation",
      isWithItems: true,
      financeEffect: "Positive Effect",
      active: true,
    },
    {
      id: 5,
      actSrl: "F01",
      activityCode: "FINC",
      activityType: "Finance",
      activityName: "Financial Services",
      isWithItems: false,
      financeEffect: "Positive Effect",
      active: true,
    },
  ]);

  // Sample client-side sub-activities data
  const [subActivities, setSubActivities] = useState<SubActivity[]>([
    {
      id: 1,
      parentId: 1,
      itmSrl: 1001,
      itemCode: "BOX",
      itemName: "Box Packaging (Standard)",
      activityName: "Packaging",
      activityType: "X-work",
      pricingMethod: "Fixed",
      active: true,
    },
    {
      id: 2,
      parentId: 1,
      itmSrl: 1002,
      itemCode: "WRAP",
      itemName: "Wrap Packaging (Premium)",
      activityName: "Packaging",
      activityType: "X-work",
      pricingMethod: "Variable",
      active: true,
    },
    {
      id: 3,
      parentId: 1,
      itmSrl: 1003,
      itemCode: "LABL",
      itemName: "Label Printing",
      activityName: "Packaging",
      activityType: "X-work",
      pricingMethod: "Fixed",
      active: true,
    },
    {
      id: 4,
      parentId: 2,
      itmSrl: 2001,
      itemCode: "BINS",
      itemName: "Basic Insurance",
      activityName: "Insurance",
      activityType: "Service",
      pricingMethod: "Percentage",
      active: true,
    },
    {
      id: 5,
      parentId: 2,
      itmSrl: 2002,
      itemCode: "PINS",
      itemName: "Premium Insurance",
      activityName: "Insurance",
      activityType: "Service",
      pricingMethod: "Percentage",
      active: true,
    },
    {
      id: 6,
      parentId: 3,
      itmSrl: 3001,
      itemCode: "WOOD",
      itemName: "Wood Material",
      activityName: "Material Handling",
      activityType: "Material",
      pricingMethod: "Fixed",
      active: true,
    },
    {
      id: 7,
      parentId: 3,
      itmSrl: 3002,
      itemCode: "PLST",
      itemName: "Plastic Material",
      activityName: "Material Handling",
      activityType: "Material",
      pricingMethod: "Fixed",
      active: true,
    },
    {
      id: 8,
      parentId: 4,
      itmSrl: 4001,
      itemCode: "LCDL",
      itemName: "Local Delivery",
      activityName: "Transportation",
      activityType: "Transport",
      pricingMethod: "Variable",
      active: true,
    },
    {
      id: 9,
      parentId: 4,
      itmSrl: 4002,
      itemCode: "INTL",
      itemName: "International Delivery",
      activityName: "Transportation",
      activityType: "Transport",
      pricingMethod: "Variable",
      active: true,
    },
    {
      id: 10,
      parentId: 5,
      itmSrl: 5001,
      itemCode: "INIT",
      itemName: "Initial Payment",
      activityName: "Financial Services",
      activityType: "Finance",
      pricingMethod: "Percentage",
      active: true,
    },
    {
      id: 11,
      parentId: 5,
      itmSrl: 5002,
      itemCode: "FINL",
      itemName: "Final Payment",
      activityName: "Financial Services",
      activityType: "Finance",
      pricingMethod: "Percentage",
      active: true,
    },
  ]);

  // Delete activity function
  const deleteActivity = (id: number) => {
    // Delete all sub-activities of the activity first
    setSubActivities(
      subActivities.filter((subActivity) => subActivity.parentId !== id)
    );

    // Then delete the activity itself
    setActivities(activities.filter((activity) => activity.id !== id));

    // Show success toast
    toast({
      title: "Success",
      description: "Activity deleted successfully",
    });

    // Close delete confirmation dialog
    setDeleteConfirmOpen(false);
  };

  // Delete sub-activity function
  const deleteSubActivity = (id: number) => {
    // Delete the sub-activity
    setSubActivities(
      subActivities.filter((subActivity) => subActivity.id !== id)
    );

    // Show success toast
    toast({
      title: "Success",
      description: "Sub-activity deleted successfully",
    });

    // Close delete confirmation dialog
    setDeleteSubConfirmOpen(false);
  };

  // Filter activities based on search term and filter type
  const filteredActivities = activities.filter((activity: Activity) => {
    const matchesSearch =
      activity.actSrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!filterType) return matchesSearch;

    switch (filterType) {
      case "activityType":
        return matchesSearch && activity.activityType === "X-work";
      case "financeEffect":
        return matchesSearch && activity.financeEffect.includes("Positive");
      case "activeStatus":
        return matchesSearch && activity.active;
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
      deleteActivity(selectedActivity.id);
    }
  };

  // Handle edit sub-activity
  const handleEditSubActivity = (subActivity: SubActivity) => {
    setSelectedSubActivity(subActivity);
    setEditSubActivityOpen(true);
  };

  // Handle delete sub-activity
  const handleDeleteSubActivity = (subActivity: SubActivity) => {
    setSelectedSubActivity(subActivity);
    setDeleteSubConfirmOpen(true);
  };

  // Confirm delete sub-activity
  const confirmDeleteSubActivity = () => {
    if (selectedSubActivity) {
      deleteSubActivity(selectedSubActivity.id);
    }
  };

  // Handle add sub-activity
  const handleAddSubActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setAddSubActivityOpen(true);
  };

  // Add activity handler
  const handleAddActivity = (newActivity: Activity) => {
    setActivities([...activities, newActivity]);
    setAddActivityOpen(false);

    toast({
      title: "Success",
      description: "Activity added successfully",
    });
  };

  // Update activity handler
  const handleUpdateActivity = (updatedActivity: Activity) => {
    setActivities(
      activities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
    setEditActivityOpen(false);

    toast({
      title: "Success",
      description: "Activity updated successfully",
    });
  };

  // Add sub-activity handler
  const handleAddSubActivity2 = (newSubActivity: SubActivity) => {
    setSubActivities([...subActivities, newSubActivity]);
    setAddSubActivityOpen(false);

    toast({
      title: "Success",
      description: "Sub-activity added successfully",
    });
  };

  // Update sub-activity handler
  const handleUpdateSubActivity = (updatedSubActivity: SubActivity) => {
    setSubActivities(
      subActivities.map((subActivity) =>
        subActivity.id === updatedSubActivity.id
          ? updatedSubActivity
          : subActivity
      )
    );
    setEditSubActivityOpen(false);

    toast({
      title: "Success",
      description: "Sub-activity updated successfully",
    });
  };

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
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
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
            onEditSubActivity={handleEditSubActivity}
            onDeleteSubActivity={handleDeleteSubActivity}
            subActivities={subActivities}
          />
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <AddActivityForm
            onClose={() => setAddActivityOpen(false)}
            onAdd={handleAddActivity}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityOpen} onOpenChange={setEditActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedActivity && (
            <EditActivityForm
              activity={selectedActivity}
              onClose={() => setEditActivityOpen(false)}
              onUpdate={handleUpdateActivity}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Sub-Activity Dialog */}
      <Dialog open={addSubActivityOpen} onOpenChange={setAddSubActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedActivity && (
            <AddSubActivityForm
              parentActivity={selectedActivity}
              onClose={() => setAddSubActivityOpen(false)}
              onAdd={handleAddSubActivity2}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sub-Activity Dialog */}
      <Dialog open={editSubActivityOpen} onOpenChange={setEditSubActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedSubActivity && (
            <EditSubActivityForm
              subActivity={selectedSubActivity}
              onClose={() => setEditSubActivityOpen(false)}
              onUpdate={handleUpdateSubActivity}
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

      {/* Delete Sub-Activity Confirmation */}
      <AlertDialog
        open={deleteSubConfirmOpen}
        onOpenChange={setDeleteSubConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sub-activity. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteSubActivity}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
