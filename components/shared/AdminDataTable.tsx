"use client";

import * as React from "react";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { PaginationFooter } from "@/components/shared/AdminPrimitives";
import { DataTableWrapper } from "@/components/shared/DataTableWrapper";

export type ServerPaginationState = {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function AdminDataTable<TData>({
  data,
  columns,
  minWidth,
  pageSize = 10,
  rowLabel = "records",
  serverPagination,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  minWidth?: string;
  pageSize?: number;
  rowLabel?: string;
  serverPagination?: ServerPaginationState;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const clientPageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const safePageIndex = Math.min(pageIndex, clientPageCount - 1);

  React.useEffect(() => {
    setPageIndex(0);
  }, [data.length, pageSize]);

  const pageRows = React.useMemo(() => {
    if (serverPagination) return data;
    return data.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);
  }, [data, pageSize, safePageIndex, serverPagination]);

  const table = useReactTable({
    data: pageRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (serverPagination) {
    const { page, pages, total, limit, onPageChange } = serverPagination;
    const displayStart = total ? (page - 1) * limit + 1 : 0;
    const displayEnd = displayStart ? displayStart + pageRows.length - 1 : 0;

    return (
      <>
        <DataTableWrapper table={table} minWidth={minWidth} displayIndexOffset={(page - 1) * limit} />
        <PaginationFooter
          label={`Showing ${displayStart ? `${displayStart} to ${displayEnd}` : "0"} of ${total} ${rowLabel}`}
          pageCount={String(Math.max(1, pages))}
          currentPage={page}
          onPageChange={onPageChange}
        />
      </>
    );
  }

  const displayStart = data.length ? safePageIndex * pageSize + 1 : 0;
  const displayEnd = Math.min(data.length, (safePageIndex + 1) * pageSize);

  return (
    <>
      <DataTableWrapper table={table} minWidth={minWidth} displayIndexOffset={safePageIndex * pageSize} />
      <PaginationFooter
        label={`Showing ${displayStart ? `${displayStart} to ${displayEnd}` : "0"} of ${data.length} ${rowLabel}`}
        pageCount={String(clientPageCount)}
        currentPage={safePageIndex + 1}
        onPageChange={(page) => setPageIndex(page - 1)}
        pageSize
      />
    </>
  );
}
