"use client";
import { Kegiatan } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
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
    <div>
      <div>Data Jadwal {kegiatan.nama}</div>
      <div>Data pengajar untuk setiap jadwal</div>
    </div>
  );
};

export default HonorariumJadwalContainer;
