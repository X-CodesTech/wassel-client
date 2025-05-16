import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ActivityTable from "@/components/ActivityTable";
import AddActivityForm from "@/components/AddActivityForm";
import EditActivityForm from "@/components/EditActivityForm";
import AddSubActivityForm from "@/components/AddSubActivityForm";
import EditSubActivityForm from "@/components/EditSubActivityForm";
import SearchFilter from "@/components/SearchFilter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Activity, SubActivity } from "@/lib/types";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubActivity, setSelectedSubActivity] = useState<SubActivity | null>(null);
  
  // Modal states
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [editActivityOpen, setEditActivityOpen] = useState(false);
  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);
  const [editSubActivityOpen, setEditSubActivityOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubConfirmOpen, setDeleteSubConfirmOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch all activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activities'],
    refetchOnWindowFocus: true
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      setDeleteConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete activity: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Delete sub-activity mutation
  const deleteSubActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sub-activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      if (selectedActivity) {
        queryClient.invalidateQueries({ queryKey: ['/api/activities', selectedActivity.id, 'sub-activities'] });
      }
      toast({
        title: "Success",
        description: "Sub-activity deleted successfully",
      });
      setDeleteSubConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete sub-activity: ${error}`,
        variant: "destructive"
      });
    }
  });

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
      deleteActivityMutation.mutate(selectedActivity.id);
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
      deleteSubActivityMutation.mutate(selectedSubActivity.id);
    }
  };

  // Handle add sub-activity
  const handleAddSubActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setAddSubActivityOpen(true);
  };

  return (
    <main>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activities Management</h2>
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
          />
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <AddActivityForm onClose={() => setAddActivityOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityOpen} onOpenChange={setEditActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedActivity && (
            <EditActivityForm 
              activity={selectedActivity} 
              onClose={() => setEditActivityOpen(false)} 
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
              This will permanently delete the activity and all its sub-activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteActivity}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sub-Activity Confirmation */}
      <AlertDialog open={deleteSubConfirmOpen} onOpenChange={setDeleteSubConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sub-activity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteSubActivity}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}