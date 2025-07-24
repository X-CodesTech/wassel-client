import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface SpecialRequirementsDropdownProps {
  options: { _id: string; portalItemNameEn: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export const SpecialRequirementsDropdown: React.FC<
  SpecialRequirementsDropdownProps
> = ({ options, value, onChange, disabled }) => {
  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt._id))
    .map((opt) => opt.portalItemNameEn)
    .join(", ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          {disabled ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
            </span>
          ) : selectedLabels ? (
            <span className="truncate">{selectedLabels}</span>
          ) : (
            <span className="text-muted-foreground">
              Select special requirements
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt._id}
            checked={value.includes(opt._id)}
            onCheckedChange={() => handleToggle(opt._id)}
            disabled={disabled}
          >
            {opt.portalItemNameEn}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
