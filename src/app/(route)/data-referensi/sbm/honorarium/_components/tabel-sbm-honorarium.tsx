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
  Row,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";

const data: SbmHonorariumWithNumber[] = [];

interface TabelSbmHonorariumProps {
  data: SbmHonorariumWithNumber[];
}
export const TabelSbmHonorarium = ({
  data: initialData,
}: TabelSbmHonorariumProps) => {
  const [data, setData] = useState<SbmHonorariumWithNumber[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmHonorariumWithNumber | null>(null);

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
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<SbmHonorariumWithNumber>(
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

  const handleEdit = (row: Row<SbmHonorariumWithNumber>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: SbmHonorariumWithNumber) => {
    console.log("Save row:", row);
    // Implement your save logic here
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleUndoEdit = (row: SbmHonorariumWithNumber) => {
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

  const handleDelete = async (row: SbmHonorariumWithNumber) => {
    console.log("Delete row:", row);
    const cfm = confirm(
      `Apakah Anda yakin ingin menghapus data ${row.jenis} ${row.uraian}?`
    );
    if (cfm) {
      const deleted = await deleteDataSbmHonorarium(row.id);
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
      frozenColumnCount={1}
      isEditing={isEditing}
      editableRowId={editableRowId}
    />
  );
};
