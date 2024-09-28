import { getOptionsPengguna, getPengguna } from "@/actions/pengguna";
import { getOptionsRole } from "@/actions/role";
import PenggunaContainer from "./_components/pengguna-container";
import TabelPengguna from "./_components/tabel-pengguna";

const ReferensiPenggunaPage = async () => {
  const data = await getPengguna();
  const optionsRole = await getOptionsRole();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Unit Kerja </h1>
      <PenggunaContainer data={data} optionsRole={optionsRole} />
    </div>
  );
};

export default ReferensiPenggunaPage;
