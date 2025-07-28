import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Edit } from "lucide-react";

interface UpdatePriceCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (value: number) => void;
  type: "price" | "cost";
  currentValue: number;
  serviceName: string;
  loading?: boolean;
}

export const UpdatePriceCostModal: React.FC<UpdatePriceCostModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  type,
  currentValue,
  serviceName,
  loading = false,
}) => {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue.toString());
      setError("");
    }
  }, [isOpen, currentValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) {
      setError("Please enter a valid positive number");
      return;
    }

    onUpdate(numValue);
  };

  const handleClose = () => {
    setError("");
    setValue("");
    onClose();
  };

  const isPrice = type === "price";
  const title = isPrice ? "Update Price" : "Update Cost";
  const icon = isPrice ? (
    <DollarSign className="h-4 w-4" />
  ) : (
    <Edit className="h-4 w-4" />
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>
            Update the {type} for "{serviceName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="value">
                {isPrice ? "New Price" : "New Cost"} ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  className="pl-10"
                  placeholder="0.00"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current {type}:</span>
                <span className="font-medium">${currentValue}</span>
              </div>
              {value && !isNaN(parseFloat(value)) && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">New {type}:</span>
                  <span
                    className={`font-medium ${
                      isPrice ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${parseFloat(value)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !value || parseFloat(value) < 0}
              className={
                isPrice
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                `Update ${title.split(" ")[1]}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
