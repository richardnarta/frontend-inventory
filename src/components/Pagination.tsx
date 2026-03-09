import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  // Page size controls (optional — pages that don't need this just omit these props)
  itemsPerPage?: number;
  onItemsPerPageChange?: (size: number) => void;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: SimplePaginationProps) {

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate visible range for info text
  const rangeStart = totalItems ? (currentPage - 1) * (itemsPerPage ?? 10) + 1 : undefined;
  const rangeEnd = totalItems
    ? Math.min(currentPage * (itemsPerPage ?? 10), totalItems)
    : undefined;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3", className)}>
      {/* Left: Items per page + info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                onItemsPerPageChange(Number(val));
                onPageChange(1); // reset to first page when changing size
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>item / halaman</span>
          </div>
        )}
        {totalItems !== undefined && rangeStart !== undefined && rangeEnd !== undefined && (
          <span className="hidden sm:inline">
            {rangeStart}–{rangeEnd} dari {totalItems} item
          </span>
        )}
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}