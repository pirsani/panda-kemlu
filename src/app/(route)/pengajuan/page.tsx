import { Kegiatan } from "@/lib/alur-proses";
import HonorariumContainer from "./_components/honorarium/honorarium-container";
import UpdateFlow from "./_components/update-flow";

const PengajuanPage = () => {
  const kegiatan: Kegiatan = {
    id: 1,
    langkahSekarang: "setup",
    langkahSelanjutnya: "pengajuan",
    status: "Draft",
  };
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1>Pengajuan</h1>
      <HonorariumContainer />
      <UpdateFlow initKegiatan={kegiatan} />
    </div>
  );
};

export default PengajuanPage;
