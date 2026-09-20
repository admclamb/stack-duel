"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { DataTableSkeleton } from "~/components/ui/data-table-skeleton";
import {
  DataTablePagination,
  type DataTablePaginationProps,
} from "./data-table-pagination";

export interface ManualPaginationProps {
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  /** Total page count from the server. Pass -1 while it's not yet known
   *  (e.g. the first page hasn't loaded), which tanstack table treats as
   *  "unknown" and disables next-page bounds checking accordingly. */
  pageCount: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  skeletonRows: number;
  paginationProps?: Omit<DataTablePaginationProps<TData>, "table">;
  onRowClick?: (row: TData) => void;
  /** Omit for client-side pagination over `data` (the default). Pass this
   *  when `data` is only ever the current server page. Pagination state
   *  then lives with the caller and every page change is a new fetch. */
  manualPagination?: ManualPaginationProps;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  skeletonRows = 5,
  paginationProps,
  onRowClick,
  manualPagination,
}: Readonly<DataTableProps<TData, TValue>>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: manualPagination.pageCount,
          state: { pagination: manualPagination.pagination },
          onPaginationChange: manualPagination.onPaginationChange,
        }
      : { getPaginationRowModel: getPaginationRowModel() }),
  });

  const rows = table.getRowModel().rows;
  let tableBodyContent: React.ReactNode;

  if (isLoading) {
    tableBodyContent = (
      <DataTableSkeleton rowCount={skeletonRows} columnCount={columns.length} />
    );
  } else if (rows.length > 0) {
    tableBodyContent = rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={onRowClick ? "cursor-pointer" : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        role={onRowClick ? "button" : undefined}
        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        onKeyDown={
          onRowClick
            ? (event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }
                event.preventDefault();
                onRowClick(row.original);
              }
            : undefined
        }
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  } else {
    tableBodyContent = (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{tableBodyContent}</TableBody>
        </Table>
      </div>
      {paginationProps ? (
        <DataTablePagination {...paginationProps} table={table} />
      ) : null}
    </div>
  );
}
