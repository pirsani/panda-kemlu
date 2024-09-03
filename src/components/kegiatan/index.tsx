"use client";
import { getKegiatanById } from "@/actions/kegiatan";
import { Kegiatan, Lokasi } from "@prisma-honorarium/client";
//import { Kegiatan } from "@/zod/schemas/kegiatan";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import TextDokumenMultiFile from "./text-dokumen-multi-file";
import TextDokumenWithPreviewButton from "./text-dokumen-with-preview-button";

interface PreviewKegiatanProps {
  kegiatan?: Kegiatan | null;
  className?: string;
}
const PreviewKegiatan = ({ kegiatan, className }: PreviewKegiatanProps) => {
  if (!kegiatan) {
    return (
      <div className="flex flex-row gap-2 w-full mt-2 p-4 border border-gray-300 rounded-sm animate-pulse">
        <span>
          Belum ada kegiatan yang dipilih. Silahkan pilih kegiatan untuk melihat
          detailnya.
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-sm", className)}>
      {!kegiatan && <>Loading detail kegiatan...</>}
      {kegiatan && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col">
            <label className="text-gray-700">Nama Kegiatan</label>
            <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
              {kegiatan.nama}
            </span>
          </div>
          <div className="flex flex-row gap-2 w-full border-2 ">
            <div className="flex flex-col w-1/3">
              <label className="text-gray-700">Tanggal Mulai</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {format(new Date(kegiatan.tanggalMulai), "yyyy-MM-dd")}
              </span>
            </div>
            <div className="flex flex-col w-1/3">
              <label className="text-gray-700">Tanggal Selesai</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1  w-full">
                {format(new Date(kegiatan.tanggalSelesai), "yyyy-MM-dd")}
              </span>
            </div>
          </div>

          <TextDokumenWithPreviewButton
            label="Dokumen Nodin/Memo/SK"
            dokumen={kegiatan.dokumenNodinMemoSk}
          />

          <TextDokumenWithPreviewButton
            label="Dokumen Jadwal Kegiatan"
            dokumen={kegiatan.dokumenJadwal}
          />

          <TextDokumenMultiFile
            label="Dokumen Surat Tugas (multiple files)"
            dokumen={[
              "file1.pdf",
              "file2.pdf",
              "file3.pdf",
              "file4.pdf",
              "file5.pdf",
              "file6.pdf",
              "file7.pdf",
              "file8.pdf",
              "file9.pdf",
              "file10.pdf",
              "file11.pdf",
              "file12.pdf",
              "file13.pdf",
              "file14.pdf",
              "file15.pdf",
              "file16.pdf",
              "file17.pdf",
              "file18.pdf",
              "file19.pdf",
              "file20.pdf",
              "file21.pdf",
              "file22.pdf",
              "file23.pdf",
              "file24.pdf",
              "file25.pdf",
              "file26.pdf",
              "file27.pdf",
              "file28.pdf",
              "file29.pdf",
              "file30.pdf",
              "file31.pdf",
              "file32.pdf",
              "file33.pdf",
              "file34.pdf",
              "file35.pdf",
              "file36.pdf",
              "file37.pdf",
              "file38.pdf",
              "file39.pdf",
              "file40.pdf",
              "file41.pdf",
              "file42.pdf",
              "file43.pdf",
              "file44.pdf",
              "file45.pdf",
              "file46.pdf",
              "file47.pdf",
              "file48.pdf",
              "file49.pdf",
              "file50.pdf",
            ]}
          />

          <div className="flex flex-col">
            <span className="text-gray-700">Lokasi</span>
            <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
              {kegiatan.lokasi}
            </span>
          </div>

          {kegiatan.lokasi == Lokasi.LuarKota && (
            <div className="flex flex-col">
              <span className="text-gray-700">Lokasi</span>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {kegiatan.lokasi}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewKegiatan;
