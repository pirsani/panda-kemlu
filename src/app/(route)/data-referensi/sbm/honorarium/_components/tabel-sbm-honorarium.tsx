"use client";
import { deleteDataSbmHonorarium } from "@/actions/excel/sbm/honorarium";
import {
  formatCurrency,
  KolomAksi,
  PaginationControls,
  TabelGeneric,
} from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { SbmHonorariumWithNumber } from "@/data/sbm-honorarum";
import { SbmHonorarium } from "@prisma-honorarium/client";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useState } from "react";

const data: SbmHonorariumWithNumber[] = [];

const columnHelper = createColumnHelper<SbmHonorariumWithNumber>();

const columns: ColumnDef<SbmHonorariumWithNumber>[] = [
  {
    id: "rowNumber",
    header: "#",
    // cell: (info) => info.row.index + 1, // Display row number (1-based index)
    footer: "#",
  },
  {
    accessorKey: "jenis",
    header: "Jenis",
    cell: (info) => info.getValue(),
    footer: "Jenis",
  },
  {
    accessorKey: "satuan",
    header: "Satuan",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "besaran",
    header: "Besaran",
    cell: formatCurrency<SbmHonorariumWithNumber>,
  },
  {
    accessorKey: "uraian",
    header: "Uraian",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "tahun",
    header: "Tahun",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: (info) =>
      KolomAksi<SbmHonorariumWithNumber>(info, handleEdit, handleDelete),
    enableSorting: false, // Disable sorting for this column
  },
];

const handleEdit = (row: SbmHonorariumWithNumber) => {
  console.log("Edit row:", row);
  // Implement your edit logic here
};

const handleDelete = async (row: SbmHonorariumWithNumber) => {
  console.log("Delete row:", row);
  const cfm = confirm(
    `Apakah Anda yakin ingin menghapus data ${row.jenis} ${row.uraian}?`
  );
  if (cfm) {
    const deleted = await deleteDataSbmHonorarium(row.id);
    //alert(deleted.message);
  } else {
    console.log("Data tidak dihapus");
  }
  // Implement your delete logic here
};

interface TabelSbmHonorariumProps {
  data: SbmHonorariumWithNumber[];
}
export const TabelSbmHonorarium = ({ data }: TabelSbmHonorariumProps) => {
  return <TabelGeneric data={data} columns={columns} frozenColumnCount={1} />;
};
