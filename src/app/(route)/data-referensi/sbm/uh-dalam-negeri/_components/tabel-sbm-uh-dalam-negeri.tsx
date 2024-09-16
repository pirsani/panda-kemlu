"use client";
import { deleteDataSbmUhDalamNegeri } from "@/actions/excel/sbm/uh-dalam-negeri";
import {
  formatCurrency,
  KolomAksi,
  PaginationControls,
  TabelGeneric,
} from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { SbmUhDalamNegeriWithNumber } from "@/data/sbm-uh-dalam-negeri";
import { SbmUhDalamNegeri } from "@prisma-honorarium/client";
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

const data: SbmUhDalamNegeriWithNumber[] = [];

interface TabelSbmUhDalamNegeriProps {
  data: SbmUhDalamNegeriWithNumber[];
  optionsProvinsi: { value: number; label: string }[];
  frozenColumnCount?: number;
}
export const TabelSbmUhDalamNegeri = ({
  data: initialData,
  optionsProvinsi,
  frozenColumnCount = 2,
}: TabelSbmUhDalamNegeriProps) => {
  const [data, setData] = useState<SbmUhDalamNegeriWithNumber[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmUhDalamNegeriWithNumber | null>(null);

  const columnHelper = createColumnHelper<SbmUhDalamNegeriWithNumber>();

  const columns: ColumnDef<SbmUhDalamNegeriWithNumber>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "provinsi.nama",
      header: "Provinsi",
      cell: (info) => info.getValue(),
      footer: "Provinsi",
      meta: {
        inputType: "select",
        options: optionsProvinsi,
        field: "provinsiId",
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "fullboard",
      header: "Fullboard",
      cell: formatCurrency<SbmUhDalamNegeriWithNumber>,
    },
    {
      accessorKey: "fulldayHalfday",
      header: "Fullday/Halfday",
      cell: formatCurrency<SbmUhDalamNegeriWithNumber>,
    },
    {
      accessorKey: "luarKota",
      header: "Luar Kota",
      cell: formatCurrency<SbmUhDalamNegeriWithNumber>,
    },
    {
      accessorKey: "dalamKota",
      header: "Dalam Kota",
      cell: formatCurrency<SbmUhDalamNegeriWithNumber>,
    },
    {
      accessorKey: "diklat",
      header: "diklat",
      cell: formatCurrency<SbmUhDalamNegeriWithNumber>,
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
        KolomAksi<SbmUhDalamNegeriWithNumber>(
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

  const handleEdit = (row: Row<SbmUhDalamNegeriWithNumber>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: SbmUhDalamNegeriWithNumber) => {
    console.log("Save row:", row);
    // Implement your save logic here
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleUndoEdit = (row: SbmUhDalamNegeriWithNumber) => {
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

  const handleDelete = async (row: SbmUhDalamNegeriWithNumber) => {
    console.log("Delete row:", row);
    const cfm = confirm(
      `Apakah Anda yakin ingin menghapus data ${row.provinsi.nama} ?`
    );
    if (cfm) {
      const deleted = await deleteDataSbmUhDalamNegeri(row.id);
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
