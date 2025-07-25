import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";

interface SpecialRequirementsDropdownProps {
  options: { _id: string; portalItemNameEn: string }[];
  value: Array<{ subActivity: string; quantity: number; note?: string }>;
  onChange: (
    items: Array<{ subActivity: string; quantity: number; note?: string }>
  ) => void;
  disabled?: boolean;
  label?: string;
}

export const SpecialRequirementsDropdown: React.FC<
  SpecialRequirementsDropdownProps
> = ({
  options,
  value,
  onChange,
  disabled,
  label = "Special requirements",
}) => {
  const handleToggle = (id: string) => {
    const existingItem = value.find((item) => item.subActivity === id);
    if (existingItem) {
      // Remove item
      onChange(value.filter((item) => item.subActivity !== id));
    } else {
      // Add item with default quantity 1
      onChange([...value, { subActivity: id, quantity: 1, note: "" }]);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    onChange(
      value.map((item) =>
        item.subActivity === id ? { ...item, quantity } : item
      )
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    onChange(
      value.map((item) => (item.subActivity === id ? { ...item, note } : item))
    );
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((item) => item.subActivity !== id));
  };

  const getSelectedIds = () => value.map((item) => item.subActivity);

  if (disabled) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">
            Loading special requirements...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700">*{label}</Label>
        <p className="text-sm text-gray-500 mt-1">
          Select one or more, or write your needed special requirements
        </p>
      </div>

      {/* Selection Buttons */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = getSelectedIds().includes(opt._id);
          return (
            <Button
              key={opt._id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={`${
                isSelected
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              }`}
              onClick={() => handleToggle(opt._id)}
              disabled={disabled}
            >
              {opt.portalItemNameEn}
            </Button>
          );
        })}
      </div>

      {/* Selected Items */}
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((item) => {
            const option = options.find((opt) => opt._id === item.subActivity);
            if (!option) return null;

            return (
              <div
                key={item.subActivity}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">
                      {option.portalItemNameEn}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.subActivity,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Note</Label>
                        <Textarea
                          value={item.note || ""}
                          onChange={(e) =>
                            handleNoteChange(item.subActivity, e.target.value)
                          }
                          placeholder="Add notes..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(item.subActivity)}
                    className="ml-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-yellow-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
