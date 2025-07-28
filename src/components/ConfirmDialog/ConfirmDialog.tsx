import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onClose: (confirmed: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  open,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={(o) => o || onClose(false)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription>{description}</DialogDescription>
      <DialogFooter>
        <Button variant="outline" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => onClose(true)}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
