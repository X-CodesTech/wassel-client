import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageLimit: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const defaultPageSizeOptions = [5, 10, 20, 50, 100];

function generatePageNumbers(current: number, totalPages: number) {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  // First 3
  pages.push(1, 2, 3);
  // Middle 3 centered on current
  let middleStart = current - 1;
  let middleEnd = current + 1;
  // Clamp middle group so it doesn't overlap with first/last 3
  if (middleStart < 4) {
    middleStart = 4;
    middleEnd = 6;
  }
  if (middleEnd > totalPages - 3) {
    middleEnd = totalPages - 3;
    middleStart = totalPages - 5;
  }
  // Add ellipsis after first 3 if needed
  if (middleStart > 4) {
    pages.push("...");
  }
  // Add middle group
  for (let i = middleStart; i <= middleEnd; i++) {
    if (i > 3 && i < totalPages - 2) {
      pages.push(i);
    }
  }
  // Add ellipsis after middle group if needed
  if (middleEnd < totalPages - 3) {
    pages.push("...");
  }
  // Last 3
  pages.push(totalPages - 2, totalPages - 1, totalPages);
  // Remove duplicates
  const result: (number | string)[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] !== pages[i - 1]) {
      result.push(pages[i]);
    }
  }
  return result;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageLimit,
  totalResults,
  onPageChange,
  onLimitChange,
  pageSizeOptions = defaultPageSizeOptions,
  className = "",
}) => {
  if (totalPages === 0) return null;
  const startResult = (currentPage - 1) * pageLimit + 1;
  const endResult = Math.min(currentPage * pageLimit, totalResults);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          Showing {startResult} to {endResult} of {totalResults} results
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select
            value={pageLimit.toString()}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
      </div>
      <div className="flex justify-center">
        <nav className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 border border-gray-200 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, idx) =>
              page === "..." ? (
                <span
                  key={"ellipsis-" + idx}
                  className="px-2 text-gray-400 text-lg font-bold select-none"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onPageChange(page as number)}
                  className={`rounded-full w-10 h-10 font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
