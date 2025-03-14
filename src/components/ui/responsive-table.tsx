
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column {
  key: string;
  header: string;
  hideOnMobile?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  className?: string;
  rowClassName?: string | ((row: any, index: number) => string);
  keyField?: string;
  superCompact?: boolean;
  darkMode?: boolean;
}

export function ResponsiveTable({
  data,
  columns,
  className = "",
  rowClassName = "",
  keyField = "id",
  superCompact = false,
  darkMode = false,
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

  return (
    <div className={`${compactMode ? "super-compact-table overflow-x-auto -mx-2" : ""} ${darkMode ? "bg-background/30 rounded-md" : ""} ${className}`}>
      <Table className={compactMode ? "text-xxs" : ""}>
        <TableHeader>
          <TableRow className={compactMode ? "h-8" : ""}>
            {visibleColumns.map((column) => (
              <TableHead 
                key={column.key} 
                className={`${compactMode ? "py-1 px-1" : ""} ${column.className || ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={getRowKey(row, rowIndex)} 
              className={`${compactMode ? "h-8" : ""} ${getRowClass(row, rowIndex)}`}
            >
              {visibleColumns.map((column) => (
                <TableCell 
                  key={`${getRowKey(row, rowIndex)}-${column.key}`} 
                  className={`${compactMode ? "py-1 px-1" : ""} ${column.className || ""}`}
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
