"use client";
import { Kegiatan } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import DaftarJadwal from "./daftar-jadwal";
interface HonorariumJadwalContainerProps {
  kegiatan: Kegiatan;
}
const HonorariumJadwalContainer = ({
  kegiatan,
}: HonorariumJadwalContainerProps) => {
  const [jadwal, setJadwal] = useState([]);
  useEffect(() => {
    const getJadwal = async () => {
      console.log("kegiatan", kegiatan);
    };
    getJadwal();
  }, [kegiatan]);
  return (
    <div className="flex flex-col w-full gap-2">
      <h2 className="font-semibold">Jadwal Narasumber</h2>
      <DaftarJadwal kegiatanId={kegiatan.id} />
      <div>Data pengajar untuk setiap jadwal</div>
    </div>
  );
};

export default HonorariumJadwalContainer;
