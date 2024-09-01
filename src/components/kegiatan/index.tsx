"use client";
import { getKegiatanById } from "@/actions/kegiatan";
import { Kegiatan } from "@prisma-honorarium/client";
//import { Kegiatan } from "@/zod/schemas/kegiatan";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface PreviewKegiatanProps {
  id?: number | null;
}
const PreviewKegiatan = ({ id }: PreviewKegiatanProps) => {
  if (!id) {
    return <h1>Belum ada kegiatan yang dipilih</h1>;
  }

  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);

  // Fetch kegiatan by id
  useEffect(() => {
    const fetchKegiatan = async () => {
      const kegiatan = await getKegiatanById(id);
      setKegiatan(kegiatan);
      console.log(kegiatan);
    };

    fetchKegiatan();
  }, [id]);

  return (
    <>
      {!kegiatan && <>Loading detail kegiatan...</>}
      {kegiatan && (
        <div className="flex flex-row gap-2 w-full mt-2 p-4 border border-gray-300 rounded-sm">
          <div className="flex flex-col sm:w-1/2 ">
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

            <div className="flex flex-col">
              <label className="text-gray-700">Lokasi</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {kegiatan.lokasi}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700">Dokumen</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {kegiatan.lokasi}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewKegiatan;
