"use client";

import * as React from "react";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { PaginationFooter } from "@/components/shared/AdminPrimitives";
import { DataTableWrapper } from "@/components/shared/DataTableWrapper";

export function AdminDataTable<TData>({
  data,
  columns,
  minWidth,
  pageSize = 10,
  rowLabel = "records",
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  minWidth?: string;
  pageSize?: number;
  rowLabel?: string;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const displayStart = data.length ? safePageIndex * pageSize + 1 : 0;
  const displayEnd = Math.min(data.length, (safePageIndex + 1) * pageSize);
  const pageRows = React.useMemo(
    () => data.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [data, pageIndex, pageSize, safePageIndex],
  );

  React.useEffect(() => {
    setPageIndex(0);
  }, [data.length, pageSize]);

  const table = useReactTable({
    data: pageRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <DataTableWrapper table={table} minWidth={minWidth} displayIndexOffset={safePageIndex * pageSize} />
      <PaginationFooter
        label={`Showing ${displayStart ? `${displayStart} to ${displayEnd}` : "0"} of ${data.length} ${rowLabel}`}
        pageCount={String(pageCount)}
        currentPage={safePageIndex + 1}
        onPageChange={(page) => setPageIndex(page - 1)}
        pageSize
      />
    </>
  );
}
