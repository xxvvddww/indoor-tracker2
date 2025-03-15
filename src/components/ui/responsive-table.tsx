
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column {
  key: string;
  header: string;
  hideOnMobile?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  width?: string;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  className?: string;
  rowClassName?: string | ((row: any, index: number) => string);
  keyField?: string;
  superCompact?: boolean;
  darkMode?: boolean;
  ultraCompact?: boolean;
  resultsMode?: boolean;
  hideHeader?: boolean;
}

export function ResponsiveTable({
  data,
  columns,
  className = "",
  rowClassName = "",
  keyField = "id",
  superCompact = false,
  darkMode = false,
  ultraCompact = false,
  resultsMode = false,
  hideHeader = false,
}: ResponsiveTableProps) {
  const isMobile = useIsMobile();
  const compactMode = isMobile || superCompact;
  
  const visibleColumns = columns.filter(col => !compactMode || !col.hideOnMobile);
  
  const getRowKey = (row: any, index: number) => {
    return row[keyField] || `row-${index}`;
  };
  
  const getRowClass = (row: any, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  let tableClassName = "w-full table-fixed ";
  if (compactMode) tableClassName += "text-xxs border-collapse ";
  if (ultraCompact) tableClassName += "ultra-compact-table ";
  if (resultsMode) tableClassName += "results-table ";

  return (
    <div className={`${compactMode ? "super-compact-table overflow-x-auto w-full" : ""} ${resultsMode ? "" : ""} ${ultraCompact ? "ultra-compact-table" : ""} ${darkMode ? "bg-background/30 rounded-md" : ""} ${className}`}>
      <Table className={tableClassName}>
        {!hideHeader && (
          <TableHeader>
            <TableRow className={`${compactMode ? "h-5" : ""} ${ultraCompact ? "h-4" : ""} ${resultsMode ? "h-6" : ""}`}>
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={`${compactMode ? "py-0.5 px-1 text-xs" : ""} ${ultraCompact ? "py-0 px-0.5 text-[0.6rem]" : ""} ${resultsMode ? "py-0 px-0.5 text-[0.65rem]" : ""} ${column.className || ""} ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                  style={{ width: column.width || 'auto' }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={getRowKey(row, rowIndex)} 
              className={`${compactMode ? "h-5" : ""} ${ultraCompact ? "h-4" : ""} ${resultsMode ? "h-6" : ""} ${getRowClass(row, rowIndex)}`}
            >
              {visibleColumns.map((column) => (
                <TableCell 
                  key={`${getRowKey(row, rowIndex)}-${column.key}`} 
                  className={`${compactMode ? "py-0.5 px-1 text-xs" : ""} ${ultraCompact ? "py-0 px-0.5 text-[0.6rem]" : ""} ${resultsMode ? "py-0 px-0.5 text-[0.65rem]" : ""} ${column.className || ""} ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                  style={{ width: column.width || 'auto' }}
                >
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
