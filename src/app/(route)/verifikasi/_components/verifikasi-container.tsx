"use client";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import dynamic from "next/dynamic";
const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const VerifikasiContainer = () => {
  return (
    <div>
      <h1>Verifikasi Container</h1>
      <div>
        <SelectKegiatan inputId="kegiatan" />
      </div>
    </div>
  );
};

export default VerifikasiContainer;
