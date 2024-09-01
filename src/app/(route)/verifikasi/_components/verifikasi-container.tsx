"use client";
import PreviewKegiatan from "@/components/kegiatan";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import dynamic from "next/dynamic";
import { useState } from "react";
const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const VerifikasiContainer = () => {
  const [kegiatan, setKegiatan] = useState<number | null>(null);

  const handleKegiatanChange = (value: number | null) => {
    console.log(value);
    setKegiatan(value);
  };
  return (
    <div>
      <h1>Verifikasi Container</h1>
      <div>
        <SelectKegiatan inputId="kegiatan" onChange={handleKegiatanChange} />
        <PreviewKegiatan id={kegiatan} />
      </div>
    </div>
  );
};

export default VerifikasiContainer;
