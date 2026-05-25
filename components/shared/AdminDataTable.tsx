"use client";

import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { DataTableWrapper } from "@/components/shared/DataTableWrapper";

export function AdminDataTable<TData>({
  data,
  columns,
  minWidth,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  minWidth?: string;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTableWrapper table={table} minWidth={minWidth} />;
}
