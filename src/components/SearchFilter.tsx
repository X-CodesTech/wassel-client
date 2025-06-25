import { useState, useRef } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterType: string | null;
  onFilterChange: (filter: string | null) => void;
  onAddActivity: () => void;
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  onAddActivity,
}: SearchFilterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const getFilterLabel = () => {
    switch (filterType) {
      case "activityType":
        return "X-work Type";
      case "activeStatus":
        return "Active Only";
      default:
        return "Filter";
    }
  };

  return (
    <div className="flex-1 flex items-center justify-between space-x-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search activities..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={filterButtonRef}
              variant="outline"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {getFilterLabel()}
              <Filter className="-mr-1 ml-2 h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() =>
                onFilterChange(
                  filterType === "activityType" ? null : "activityType"
                )
              }
              className={filterType === "activityType" ? "bg-gray-100" : ""}
            >
              X-work Type
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFilterChange(
                  filterType === "financeEffect" ? null : "financeEffect"
                )
              }
              className={filterType === "financeEffect" ? "bg-gray-100" : ""}
            >
              Positive Finance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onFilterChange(
                  filterType === "activeStatus" ? null : "activeStatus"
                )
              }
              className={filterType === "activeStatus" ? "bg-gray-100" : ""}
            >
              Active Status
            </DropdownMenuItem>
            {filterType && (
              <DropdownMenuItem
                onClick={() => onFilterChange(null)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Filter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={onAddActivity}
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Activity
        </Button>
      </div>
    </div>
  );
}
