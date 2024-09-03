"use client";

import { getJadwalByKegiatanId, JadwalKelasNarasumber } from "@/data/jadwal";
import { cn } from "@/lib/utils";
import { formatHariTanggal } from "@/utils/date-format";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import NarasumberListItem from "./narasumber-list-item";

interface DaftarJadwalProps {
  kegiatanId: number;
}
const DaftarJadwal = ({ kegiatanId }: DaftarJadwalProps) => {
  const [dataJadwal, setDataJadwal] = useState<JadwalKelasNarasumber[]>([]);
  useEffect(() => {
    const getJadwal = async () => {
      const dataJadwal = await getJadwalByKegiatanId(kegiatanId);
      setDataJadwal(dataJadwal);
    };
    getJadwal();
  }, [kegiatanId]);

  return (
    <>
      {dataJadwal &&
        dataJadwal.map((jadwal) => {
          return (
            <div className="w-full border border-gray-300">
              <div className="flex flex-row w-full ">
                <div className="px-4 w-1/3 py-2  border-b border-gray-300">
                  {jadwal.kelas.nama}
                </div>
                <div className="px-4 py-2 w-full border-b border-gray-300">
                  {jadwal.materi.nama}
                </div>
                <div className="px-4 py-2 w-full border-b border-gray-300">
                  {formatHariTanggal(jadwal.tanggal)}
                </div>
              </div>

              <div className="flex flex-col w-full px-4 py-2">
                {jadwal.jadwalNarasumber.map((jadwalNarsum, index) => {
                  const jumlahNarsum = jadwal.jadwalNarasumber.length;
                  return (
                    <NarasumberListItem
                      index={index}
                      jadwal={jadwalNarsum}
                      totalNarsum={jumlahNarsum}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
    </>
  );
};

export default DaftarJadwal;
