"use client";
import { deleteDataSbmUhLuarNegeri } from "@/actions/excel/sbm/uh-luar-negeri";
import {
  formatCurrency,
  KolomAksi,
  PaginationControls,
  TabelGeneric,
} from "@/components/tabel-generic";
import { Button } from "@/components/ui/button";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { SbmUhLuarNegeriWithNumber } from "@/data/sbm-uh-luar-negeri";
import { useSearchTerm } from "@/hooks/use-search-term";
import { SbmUhLuarNegeri } from "@prisma-honorarium/client";
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
import { info } from "console";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ZodError } from "zod";

const data: SbmUhLuarNegeriWithNumber[] = [];

interface TabelSbmUhLuarNegeriProps {
  data: SbmUhLuarNegeriWithNumber[];
  optionsNegara: { value: string; label: string }[];
  frozenColumnCount?: number;
}
export const TabelSbmUhLuarNegeri = ({
  data: initialData,
  optionsNegara,
  frozenColumnCount = 2,
}: TabelSbmUhLuarNegeriProps) => {
  const [data, setData] = useState<SbmUhLuarNegeriWithNumber[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmUhLuarNegeriWithNumber | null>(null);
  const [errors, setErrors] = useState<ZodError | null>(null);
  const { searchTerm } = useSearchTerm();
  const columnHelper = createColumnHelper<SbmUhLuarNegeriWithNumber>();

  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.negara.nama?.toLowerCase().includes(word) ||
        row.tahun.toString().toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<SbmUhLuarNegeriWithNumber>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "negara.nama",
      header: "Negara",
      cell: (info) => info.getValue(),
      footer: "Negara",
      meta: {
        isCellEditable: false, // Disable cell editing for this column
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "golonganA",
      header: "Golongan A",
      cell: (info) => formatCurrency<SbmUhLuarNegeriWithNumber>(info, "USD"),
    },
    {
      accessorKey: "golonganB",
      header: "Golongan B",
      cell: (info) => formatCurrency<SbmUhLuarNegeriWithNumber>(info, "USD"),
    },
    {
      accessorKey: "golonganC",
      header: "Golongan C",
      cell: (info) => formatCurrency<SbmUhLuarNegeriWithNumber>(info, "USD"),
    },
    {
      accessorKey: "golonganD",
      header: "Golongan D",
      cell: (info) => formatCurrency<SbmUhLuarNegeriWithNumber>(info, "USD"),
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
        KolomAksi<SbmUhLuarNegeriWithNumber>(
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

  const handleEdit = (row: Row<SbmUhLuarNegeriWithNumber>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: SbmUhLuarNegeriWithNumber) => {
    console.log("Save row:", row);
    // Implement your save logic here
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleUndoEdit = (row: SbmUhLuarNegeriWithNumber) => {
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

  const handleDelete = async (row: SbmUhLuarNegeriWithNumber) => {
    console.log("Delete row:", row);
    const cfm = confirm(
      `Apakah Anda yakin ingin menghapus data sbm ${row.negara.nama} ?`
    );
    if (cfm) {
      const deleted = await deleteDataSbmUhLuarNegeri(row.id);
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
      data={filteredData}
      columns={columns}
      frozenColumnCount={frozenColumnCount}
      isEditing={isEditing}
      editableRowId={editableRowId}
    />
  );
};
