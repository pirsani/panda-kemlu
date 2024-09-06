"use client";

import { getOptionsSbmHonorarium, OptionSbm } from "@/actions/sbm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getJadwalByKegiatanId, JadwalKelasNarasumber } from "@/data/jadwal";
import { cn } from "@/lib/utils";
import { formatHariTanggal } from "@/utils/date-format";
import Decimal from "decimal.js";
import { ChevronRight } from "lucide-react";
import { use, useEffect, useState } from "react";
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

  const [optionsSbmHonorarium, setOptionsSbmHonorarium] = useState<OptionSbm[]>(
    []
  );

  useEffect(() => {
    const fetchOptionsSbmHonorarium = async () => {
      const optionsSbm = await getOptionsSbmHonorarium();

      const convertedData = optionsSbm.map((item) => ({
        ...item,
        besaran: new Decimal(item.besaran ?? 0), // Convert to Decimal
      }));

      if (optionsSbm) {
        setOptionsSbmHonorarium(convertedData);
      }
    };
    fetchOptionsSbmHonorarium();
  }, []);

  // dataJadwal merupakan array of Jadwal (kelas, materi,  jadwalNarasumber[])
  // asumsinya setiap kegiatan dapat memiliki lebih dari 1 jadwal (kelas, materi, narasumber)
  // pengajuan honorarium narasumber dilakukan per jadwal, karena perkelas bisa memiliki narasumber yang berbeda maka terdapat jadwalNarasumber[] yang masing masing berisi data narasumber dan besaran honorarium bisa berbeda secara manual ditentukan oleh user dengan memilih dari dropdown sbm jenis honorarium dan JP nya

  // pengajuan dilakukan per-jadwal , sehingga tidak bisa masing-masing narasumber diproses terpisah
  // karena pengajuan dilakukan per-jadwal, maka log status di tulis di jadwal, bukan di jadwalNarasumber

  return (
    <>
      {dataJadwal &&
        dataJadwal.map((jadwal, index) => {
          return (
            <div key={index} className="w-full border border-gray-300">
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
                      key={index}
                      optionsSbmHonorarium={optionsSbmHonorarium}
                      index={index}
                      jadwal={jadwalNarsum}
                      totalNarsum={jumlahNarsum}
                    />
                  );
                })}
              </div>

              <div className="flex flex-col w-full ">
                <div className="px-4 py-2 w-full border-t border-gray-300">
                  <div className="flex flex-row justify-between">
                    <div className="text-gray-500">Total</div>
                    <div className="text-gray-500">Rp. 1.000.000</div>
                  </div>
                </div>
                <div className="px-4 py-2 w-full border-t border-gray-300">
                  <div className="flex flex-row justify-between">
                    <div className="text-gray-500">Status</div>
                    <div className="text-gray-500">
                      Revisi/Disetujui/Dibayar
                    </div>
                  </div>
                </div>
                <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
                  <div>
                    <Textarea
                      placeholder="Catatan"
                      className="w-full border-blue-500"
                    />
                  </div>
                  <div className="flex flex-row justify-start gap-4">
                    <Button
                      className={cn(
                        "bg-red-500 text-white",
                        "hover:bg-green-600"
                      )}
                    >
                      Revisi
                    </Button>
                    <Button
                      className={cn(
                        "bg-blue-500 text-white",
                        "hover:bg-blue-600"
                      )}
                    >
                      Setuju
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default DaftarJadwal;
