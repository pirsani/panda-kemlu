"use client";
import {
  deleteDataPejabatPerbendaharaan,
  simpanPejabatPerbendaharaan,
} from "@/actions/pejabat-perbendaharaan";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";

import {
  KolomAksi,
  KolomPilihanAksi,
  TabelGenericWithoutInlineEdit,
} from "@/components/tabel-generic-without-inline-edit";
import { Button } from "@/components/ui/button";
import { PejabatPerbendaharaanWithStringDate } from "@/data/pejabat-perbendaharaan";
import { useSearchTerm } from "@/hooks/use-search-term";
import {
  pejabatPerbendaharaanSchema,
  PejabatPerbendaharaan as ZPejabatPerbendaharaan,
} from "@/zod/schemas/pejabat-perbendaharaan";
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
import { ZodError } from "zod";

const data: PejabatPerbendaharaanWithStringDate[] = [];

interface TabelPejabatPerbendaharaanProps {
  data: PejabatPerbendaharaanWithStringDate[];
  frozenColumnCount?: number;
  onEdit?: (row: PejabatPerbendaharaanWithStringDate) => void;
}
export const TabelPejabatPerbendaharaan = ({
  data: initialData,
  frozenColumnCount = 3,
  onEdit = () => {},
}: TabelPejabatPerbendaharaanProps) => {
  const [data, setData] =
    useState<PejabatPerbendaharaanWithStringDate[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<PejabatPerbendaharaanWithStringDate | null>(null);
  const [errors, setErrors] = useState<ZodError | null>(null);

  const { searchTerm } = useSearchTerm();

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
        row.nama?.toLowerCase().includes(word) ||
        row.jabatan.nama?.toLowerCase().includes(word) ||
        row.satker?.nama?.toLowerCase().includes(word)
    );
  });

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
    },
    {
      accessorKey: "jabatan.nama",
      header: "Jabatan",
      cell: (info) => info.getValue(),
      footer: "Jabatan",
    },
    {
      accessorKey: "nama",
      header: "Nama",
      cell: (info) => info.getValue(),
      meta: { className: "w-[200px]" },
    },
    {
      accessorKey: "NIP",
      header: "NIP",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "pangkatGolonganId",
      header: "Golongan/Ruang",
      cell: (info) => info.getValue(),
    },

    {
      accessorKey: "NIK",
      header: "NIK",
      cell: (info) => info.getValue(),
    },

    {
      accessorKey: "tmtMulai",
      header: "Tmt Mulai",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return format(date, "yyyy-MM-dd");
      },
    },
    {
      accessorKey: "tmtSelesai",
      header: "Tmt Selesai",
      cell: (info) => {
        if (info.getValue()) {
          const date = new Date(info.getValue() as string);
          return format(date, "yyyy-MM-dd");
        } else {
          return "Hingga saat ini";
        }
      },
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomPilihanAksi<PejabatPerbendaharaanWithStringDate>(
          info,
          ["edit", "delete"],
          isEditing,
          handleEdit,
          handleDelete
        ),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const handleEdit = (row: Row<PejabatPerbendaharaanWithStringDate>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data
    onEdit(row.original);
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
    <>
      {errors && <ZodErrorList error={errors} />}
      <TabelGenericWithoutInlineEdit
        data={filteredData}
        columns={columns}
        frozenColumnCount={frozenColumnCount}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
    </>
  );
};
