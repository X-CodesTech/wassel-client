import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/appConstants";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetActivities,
  actRemoveActivity,
} from "@/store/activities/activitiesSlice";
import { actGetTransactionTypes } from "@/store/transactionTypes/transactionTypesSlice";
import { Activity } from "@/types/types";
import { axiosErrorHandler } from "@/utils";
import { useEffect, useState } from "react";

export const useActivityManagement = () => {
  const dispatch = useAppDispatch();
  const {
    records: activities,
    loading,
    error,
  } = useAppSelector((state) => state.activities);
  const { toast } = useToast();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(
    null
  );
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Modal states
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [isAddSubActivityOpen, setIsAddSubActivityOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Filter activities based on search term and filter type
  const filteredActivities =
    activities?.filter((activity: Activity) => {
      const matchesSearch =
        activity.actSrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activityCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
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
    }) || [];

  // Handlers
  const handleToggleExpand = (actSrl: string) => {
    setExpandedActivityId(expandedActivityId === actSrl ? null : actSrl);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsEditActivityOpen(true);
  };

  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDeleteConfirmOpen(true);
  };

  const handleAddSubActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsAddSubActivityOpen(true);
  };

  const confirmDeleteActivity = async () => {
    if (!selectedActivity?._id) return;

    try {
      await dispatch(actRemoveActivity(selectedActivity._id)).unwrap();
      toast({
        title: "Success",
        description: SUCCESS_MESSAGES.ACTIVITY_DELETED,
      });
      dispatch(actGetActivities());
    } catch (error) {
      toast({
        title: "Failed",
        description: axiosErrorHandler(error),
        variant: "destructive",
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedActivity(null);
    }
  };

  const closeModals = () => {
    setIsAddActivityOpen(false);
    setIsEditActivityOpen(false);
    setIsAddSubActivityOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedActivity(null);
  };

  // Initialize data
  useEffect(() => {
    dispatch(actGetActivities());
    dispatch(actGetTransactionTypes());
  }, [dispatch]);

  return {
    // State
    activities: filteredActivities,
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

    // Setters
    setSearchTerm,
    setFilterType,
    setIsAddActivityOpen,
    setIsEditActivityOpen,
    setIsAddSubActivityOpen,
    setIsDeleteConfirmOpen,

    // Handlers
    handleToggleExpand,
    handleEditActivity,
    handleDeleteActivity,
    handleAddSubActivity,
    confirmDeleteActivity,
    closeModals,
  };
};
