import getPesertaKegiatanDalamNegeri from "@/actions/kegiatan/peserta/dalam-negeri";
import { Kegiatan, PesertaKegiatan } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import { PesertaKegiatanTable } from "../../uang-harian/peserta-kegiatan-table-dalam-negeri";

interface UangHarianDalamNegeriContainerProps {
  kegiatan: Kegiatan | null;
}
const UangHarianDalamNegeriContainer = ({
  kegiatan,
}: UangHarianDalamNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatan[] | null>(null);
  useEffect(() => {
    const getPesertaKegiatan = async () => {
      if (!kegiatan) return;
      const peserta = await getPesertaKegiatanDalamNegeri(kegiatan.id);
      if (peserta.success) {
        setPeserta(peserta.data);
        console.log(peserta.data);
      } else {
        setPeserta(null);
        console.error(peserta.message);
      }
    };
    getPesertaKegiatan();
  }, [kegiatan]);

  return (
    <div>
      <h1>Uang Harian Dalam Negeri Container</h1>
      {peserta && <PesertaKegiatanTable data={peserta} />}
    </div>
  );
};

export default UangHarianDalamNegeriContainer;
