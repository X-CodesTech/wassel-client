import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Clock, AlertTriangle } from "lucide-react";

interface DraftRestorationDialogProps {
  isOpen: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  draftInfo?: {
    currentStep: number;
    timestamp: number;
  };
}

export const DraftRestorationDialog = ({
  isOpen,
  onRestore,
  onDiscard,
  draftInfo,
}: DraftRestorationDialogProps) => {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1:
        return "Basic Order Information";
      case 2:
        return "Pickup & Delivery Details";
      case 3:
        return "Shipping Information";
      default:
        return "Unknown Step";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Restore Draft Order?
          </DialogTitle>
          <DialogDescription>
            We found a draft order that was saved{" "}
            {draftInfo ? formatTimeAgo(draftInfo.timestamp) : "recently"}. Would
            you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>

        {draftInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              <span>Last saved: {formatTimeAgo(draftInfo.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Progress: {getStepName(draftInfo.currentStep)}</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="w-full sm:w-auto"
          >
            Start Fresh
          </Button>
          <Button
            onClick={onRestore}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Restore Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
