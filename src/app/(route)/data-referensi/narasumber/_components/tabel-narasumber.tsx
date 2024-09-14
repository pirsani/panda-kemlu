"use client";
import { PaginationControls, TabelGeneric } from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";

const data: Narasumber[] | NarasumberWithStringDate = [];

const columns: ColumnDef<NarasumberWithStringDate>[] = [
  {
    accessorKey: "nama",
    header: "Nama",
    cell: (info) => info.getValue(),
    footer: "Nama",
  },
  {
    accessorKey: "id",
    header: "NIK",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "NIP",
    header: "NIP",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "jabatan",
    header: "jabatan",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "eselon",
    header: "Eselon",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "pangkatGolonganId",
    header: "Golongan/Ruang",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "createdBy",
    header: "Dibuat Oleh",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: (info) => info.getValue(),
  },
];

interface TabelNarasumberProps {
  data: NarasumberWithStringDate[];
}
export const TabelNarasumber = ({ data }: TabelNarasumberProps) => {
  return <TabelGeneric data={data} columns={columns} />;
};
