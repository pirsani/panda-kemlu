"use client";
import { PaginationControls, TabelGeneric } from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
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

const data: Narasumber[] | NarasumberWithStringDate = [];

const columnHelper = createColumnHelper<NarasumberWithStringDate>();

const columns: ColumnDef<NarasumberWithStringDate>[] = [
  {
    accessorKey: "nama",
    header: "Nama",
    cell: (info) => info.getValue(),
    footer: "Nama",
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "id",
    header: "NIK",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "NIP",
    header: "NIP",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "jabatan",
    header: "jabatan",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "eselon",
    header: "Eselon",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "pangkatGolonganId",
    header: "Golongan/Ruang",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
    meta: { rowSpan: 2 },
  },
  columnHelper.group({
    id: "bank",
    header: () => "Bank",
    columns: [
      columnHelper.accessor("bank", {
        cell: (info) => info.getValue(),
        header: "Bank",
      }),
      columnHelper.accessor((row) => row.namaRekening, {
        id: "namaRekening",
        cell: (info) => info.getValue(),
        header: "Nama Rekening",
      }),
      columnHelper.accessor((row) => row.nomorRekening, {
        id: "nomorRekening",
        cell: (info) => info.getValue(),
        header: "Nomor Rekening",
      }),
    ],
  }),
  // {
  //   accessorKey: "createdBy",
  //   header: "Dibuat Oleh",
  //   cell: (info) => info.getValue(),
  // },
  {
    accessorKey: "createdAt",
    header: "Tanggal input",
    cell: (info) => {
      const date = new Date(info.getValue() as string);
      return format(date, "dd/MM/yyyy HH:mm:ss");
    },
  },
];

interface TabelNarasumberProps {
  data: NarasumberWithStringDate[];
}
export const TabelNarasumber = ({ data }: TabelNarasumberProps) => {
  return <TabelGeneric data={data} columns={columns} frozenColumnCount={1} />;
};
