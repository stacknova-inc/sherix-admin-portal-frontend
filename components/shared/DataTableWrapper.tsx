"use client";

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function shouldMaskCell(columnId: string, header: unknown) {
  if (columnId === "displayId") return false;
  if (columnId === "index") return true;
  if (["id", "jobId", "requestId", "resourceId", "providerId", "userId", "disputeId", "reviewId", "transactionId", "payoutId"].includes(columnId)) {
    return true;
  }
  return typeof header === "string" && /\b(id|ids)\b/i.test(header);
}

export function DataTableWrapper<TData>({
  table,
  minWidth = "980px",
  displayIndexOffset = 0,
}: {
  table: TanStackTable<TData>;
  minWidth?: string;
  displayIndexOffset?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table style={{ minWidth }} containerClassName="max-h-[60vh]">
        <TableHeader className="sticky top-0 z-10 bg-card">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const displayIndex = displayIndexOffset + row.index + 1;
                  const content = shouldMaskCell(cell.column.id, cell.column.columnDef.header) ? (
                    <span className="font-black tabular-nums">{displayIndex}</span>
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  );

                  return <TableCell key={cell.id}>{content}</TableCell>;
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-muted-foreground">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
