
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface FixturesPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

export const FixturesPagination = ({ currentPage, totalPages, handlePageChange }: FixturesPaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-2">
      <PaginationContent className="h-6">
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(currentPage - 1)}
            className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} h-5 w-5 p-0 flex items-center justify-center`} 
          />
        </PaginationItem>
        
        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
          let pageToShow;
          if (totalPages <= 3) {
            pageToShow = i + 1;
          } else if (currentPage <= 2) {
            if (i < 2) {
              pageToShow = i + 1;
            } else {
              pageToShow = totalPages;
            }
          } else if (currentPage >= totalPages - 1) {
            if (i === 0) {
              pageToShow = 1;
            } else {
              pageToShow = totalPages - (2 - i);
            }
          } else {
            if (i === 0) {
              pageToShow = 1;
            } else if (i === 2) {
              pageToShow = totalPages;
            } else {
              pageToShow = currentPage;
            }
          }
          
          return (
            <PaginationItem key={pageToShow}>
              <PaginationLink
                isActive={currentPage === pageToShow}
                onClick={() => handlePageChange(pageToShow)}
                className="cursor-pointer h-5 w-5 p-0 flex items-center justify-center text-[0.65rem]"
              >
                {pageToShow}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} h-5 w-5 p-0 flex items-center justify-center`} 
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
