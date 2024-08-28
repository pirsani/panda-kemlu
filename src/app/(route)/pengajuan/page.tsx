import { Kegiatan } from "@/lib/alur-proses";
import UpdateFlow from "./_components/update-flow";

const PengajuanPage = () => {
  const kegiatan: Kegiatan = {
    id: 1,
    langkahSekarang: "setup",
    langkahSelanjutnya: "pengajuan",
    status: "Draft",
  };
  return (
    <div>
      <h1>Pengajuan</h1>
      <UpdateFlow initKegiatan={kegiatan} />
    </div>
  );
};

export default PengajuanPage;
