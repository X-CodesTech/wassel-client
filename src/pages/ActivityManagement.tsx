import ActivityTable from "@/components/ActivityTable";
import AddActivityForm from "@/components/AddActivityForm";
import EditActivityForm from "@/components/EditActivityForm";
import { ErrorComponent } from "@/components/ErrorComponents";
import { ActivitiesPageSkeleton } from "@/components/LoadingComponents";
import SearchFilter from "@/components/SearchFilter";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LOADING_STATES } from "@/constants/appConstants";
import { useActivityManagement } from "@/hooks/useActivityManagement";

export default function ActivityManagement() {
  const {
    activities,
    loading,
    error,
    searchTerm,
    filterType,
    expandedActivityId,
    selectedActivity,
    isAddActivityOpen,
    isEditActivityOpen,
    isAddSubActivityOpen,
    isDeleteConfirmOpen,
    setSearchTerm,
    setFilterType,
    setIsAddActivityOpen,
    setIsEditActivityOpen,
    setIsAddSubActivityOpen,
    setIsDeleteConfirmOpen,
    handleToggleExpand,
    handleEditActivity,
    handleDeleteActivity,
    handleAddSubActivity,
    confirmDeleteActivity,
    closeModals,
  } = useActivityManagement();

  if (loading === LOADING_STATES.PENDING && !activities.length) {
    return <ActivitiesPageSkeleton />;
  }

  if (loading === LOADING_STATES.REJECTED && error) {
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
                onAddActivity={() => setIsAddActivityOpen(true)}
              />
            </div>
          </div>

          <ActivityTable
            activities={activities}
            expandedActivity={expandedActivityId}
            onToggleExpand={handleToggleExpand}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddSubActivity={handleAddSubActivity}
            handleAddSubActivityOpen={() => setIsAddSubActivityOpen(true)}
          />
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent className="max-w-[974px] w-full">
          <AddActivityForm onClose={() => setIsAddActivityOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditActivityOpen} onOpenChange={setIsEditActivityOpen}>
        <DialogContent className="max-w-[974px] w-full">
          {selectedActivity && (
            <EditActivityForm
              activity={selectedActivity}
              onClose={() => setIsEditActivityOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Activity Confirmation */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
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
