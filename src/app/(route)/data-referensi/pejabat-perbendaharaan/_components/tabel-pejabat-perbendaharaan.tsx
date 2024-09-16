"use client";
import { deleteDataPejabatPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import {
  formatCurrency,
  KolomAksi,
  PaginationControls,
  TabelGeneric,
} from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { PejabatPerbendaharaanWithStringDate } from "@/data/pejabat-perbendaharaan";
import { PejabatPerbendaharaan } from "@prisma-honorarium/client";
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

const data: PejabatPerbendaharaanWithStringDate[] = [];

interface TabelPejabatPerbendaharaanProps {
  data: PejabatPerbendaharaanWithStringDate[];
  optionsJenisJabatan?: { value: string; label: string }[];
  optionsSatker?: { value: string; label: string }[];
  frozenColumnCount?: number;
}
export const TabelPejabatPerbendaharaan = ({
  data: initialData,
  optionsJenisJabatan = [],
  optionsSatker = [],
  frozenColumnCount = 2,
}: TabelPejabatPerbendaharaanProps) => {
  const [data, setData] =
    useState<PejabatPerbendaharaanWithStringDate[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<PejabatPerbendaharaanWithStringDate | null>(null);

  const columnHelper =
    createColumnHelper<PejabatPerbendaharaanWithStringDate>();

  const columns: ColumnDef<PejabatPerbendaharaanWithStringDate>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "satker.nama",
      header: "Satker",
      cell: (info) => info.getValue(),
      footer: "Satker",
      meta: {
        inputType: "select",
        options: optionsSatker,
        field: "satkerId",
      },
    },
    {
      accessorKey: "nama",
      header: "Nama",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "jabatan.nama",
      header: "Jabatan",
      cell: (info) => info.getValue(),
      footer: "Jabatan",
      meta: {
        inputType: "select",
        options: optionsJenisJabatan,
        field: "jabatanId",
      },
    },
    {
      accessorKey: "tmtMulai",
      header: "Tmt Mulai",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return format(date, "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "tmtSelesai",
      header: "Tmt Selesai",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return format(date, "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<PejabatPerbendaharaanWithStringDate>(
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
  ];

  const handleEdit = (row: Row<PejabatPerbendaharaanWithStringDate>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: PejabatPerbendaharaanWithStringDate) => {
    console.log("Save row:", row);
    // Implement your save logic here
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleUndoEdit = (row: PejabatPerbendaharaanWithStringDate) => {
    console.log("Undo edit row:", row);
    // Implement your undo edit logic here
    if (originalData) {
      setData((prevData) =>
        prevData.map((item) => (item.id === row.id ? originalData : item))
      );
    }
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleDelete = async (row: PejabatPerbendaharaanWithStringDate) => {
    console.log("Delete row:", row);
    const cfm = confirm(
      `Apakah Anda yakin ingin menghapus data ${row.nama} sebagai ${row.jabatanId} ?`
    );
    if (cfm) {
      const deleted = await deleteDataPejabatPerbendaharaan(row.id);
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
      frozenColumnCount={frozenColumnCount}
      isEditing={isEditing}
      editableRowId={editableRowId}
    />
  );
};
