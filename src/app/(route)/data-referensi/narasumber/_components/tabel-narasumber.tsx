"use client";
import simpanNarasumber from "@/actions/narasumber";
import {
  KolomAksi,
  PaginationControls,
  TabelGeneric,
} from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { narasumberSchema } from "@/zod/schemas/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ZodError } from "zod";

const data: Narasumber[] | NarasumberWithStringDate = [];

const columnHelper = createColumnHelper<NarasumberWithStringDate>();

interface TabelNarasumberProps {
  data: NarasumberWithStringDate[];
}
export const TabelNarasumber = ({
  data: initialData,
}: TabelNarasumberProps) => {
  const [data, setData] = useState<NarasumberWithStringDate[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<NarasumberWithStringDate | null>(null);
  const [errors, setErrors] = useState<ZodError | null>(null);

  const columns: ColumnDef<NarasumberWithStringDate>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
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
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<NarasumberWithStringDate>(
          info,
          handleEdit,
          handleDelete,
          handleOnSave,
          handleUndoEdit,
          isEditing
        ),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
    // {
    //   accessorKey: "createdBy",
    //   header: "Dibuat Oleh",
    //   cell: (info) => info.getValue(),
    // },
    // {
    //   accessorKey: "createdAt",
    //   header: "Tanggal input",
    //   cell: (info) => {
    //     const date = new Date(info.getValue() as string);
    //     return format(date, "dd/MM/yyyy HH:mm:ss");
    //   },
    // },
  ];

  const handleEdit = (row: Row<NarasumberWithStringDate>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data
    alert("I will be edited");
    // setIsEditing(true);
    // setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: NarasumberWithStringDate) => {
    console.log("Save row:", row);
    // Implement your save logic here
  };

  const handleUndoEdit = (row: NarasumberWithStringDate) => {
    console.log("Undo edit row:", row);
    // Implement your undo edit logic here
    if (originalData) {
      setData((prevData) =>
        prevData.map((item) => (item.id === row.id ? originalData : item))
      );
    }
    setErrors(null);
    // setIsEditing(false);
    // setEditableRowIndex(null);
  };

  const handleDelete = async (row: NarasumberWithStringDate) => {
    console.log("Delete row:", row);
    const cfm = confirm(`Apakah Anda yakin ingin menghapus data ${row.nama} ?`);
    if (cfm) {
      const deleted = await deleteNarasumber(row.id);
      if (deleted.success) {
        //alert("Data berhasil dihapus");
        console.log("Data dihapus");
      } else {
        console.log("Data tidak dihapus");
      }
      //alert(deleted.message);
    } else {
      console.log("Data tidak dihapus");
    }
    // Implement your delete logic here
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <TabelGeneric
      data={data}
      columns={columns}
      frozenColumnCount={2}
      isEditing={isEditing}
      editableRowId={editableRowId}
    />
  );
};
