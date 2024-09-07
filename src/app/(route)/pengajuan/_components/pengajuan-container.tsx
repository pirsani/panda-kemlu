"use client";
import { getKegiatanById } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { JenisPengajuan } from "@/types";
import { Kegiatan, RiwayatProses } from "@prisma-honorarium/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getRiwayatProses } from "@/actions/kegiatan/proses";
import ButtonsPengajuan from "./buttons-pengajuan";
import FormPengajuanGenerateRampungan from "./form-pengajuan-generate-rampungan";
import { DisplayFormPengajuanGenerateRampungan } from "./honorarium/display-form-pengajuan-generate-rampungan";
import HonorariumContainer from "./honorarium/honorarium-container";
import PenggantianContainer from "./penggantian-container";
import PihakKe3Container from "./pihak-ke3-container";
import UhDalamNegeriContainer from "./uh-dalam-negeri-container";
import UhLuarNegeriContainer from "./uh-luar-negeri-container";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const PengajuanContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<number | null>(null);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [riwayatProses, setRiwayatProses] = useState<RiwayatProses[]>([]);
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    null
  );
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };

  const handleKegiatanChange = (value: number | null) => {
    console.log(value);
    setJenisPengajuan(null);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };

  const handleSuccessPengajuanRampungan = (kegiatan: Kegiatan) => {
    // update existing kegiatan
    setKegiatan(kegiatan);
  };

  useEffect(() => {
    console.log("kegiatanId", kegiatanId);
    const getKegiatan = async () => {
      if (kegiatanId) {
        const data = await getKegiatanById(kegiatanId);
        const riwayat = await getRiwayatProses(kegiatanId);
        setKegiatan(data);
        setRiwayatProses(riwayat);
      }
    };
    getKegiatan();
  }, [kegiatanId]);

  return (
    <div className="relative flex flex-col w-full gap-6 pb-20">
      <div className="w-1/2 flex flex-col gap-2 ">
        <SelectKegiatan inputId="kegiatan" onChange={handleKegiatanChange} />
        <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-2 ">
        <span>{jenisPengajuan}</span>
        <ButtonsPengajuan
          jenisPengajuan={jenisPengajuan}
          handleSelection={handleSelection}
          kegiatan={kegiatan}
          riwayatProses={riwayatProses}
        />

        <DisplayFormPengajuanGenerateRampungan
          jenisPengajuan={jenisPengajuan}
          kegiatan={kegiatan}
          handleSuccess={handleSuccessPengajuanRampungan}
        />

        {jenisPengajuan == "HONORARIUM" && kegiatan && (
          <HonorariumContainer kegiatan={kegiatan} />
        )}
        {jenisPengajuan == "UH_DALAM_NEGERI" && kegiatan && (
          <UhDalamNegeriContainer kegiatanId={kegiatan.id} />
        )}
        {jenisPengajuan == "UH_LUAR_NEGERI" && <UhLuarNegeriContainer />}
        {jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" && (
          <PenggantianContainer />
        )}
        {jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" && <PihakKe3Container />}
      </div>

      <FloatingComponent>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default PengajuanContainer;
