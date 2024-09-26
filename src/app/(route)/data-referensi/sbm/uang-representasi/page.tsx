import { getOptionsPejabatEselon2keAtas } from "@/actions/sbm";
import { getSbmUangRepresentasi } from "@/actions/sbm/uang-representasi";
import { get } from "lodash";
import { DialogTambahSbmUangRepresentasi } from "./_components/dialog-tambah-sbm-uang-representasi";
import FormSbmUangRepresentasi from "./_components/form-sbm-uang-representasi";
import { TabelSbmUangRepresentasi } from "./_components/tabel-sbm-uang-representasi";

const SbmUangRepresentasiPage = async () => {
  const data = await getSbmUangRepresentasi();
  const optionsPejabat = await getOptionsPejabatEselon2keAtas();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM Uang Representasi </h1>
      <DialogTambahSbmUangRepresentasi />
      <TabelSbmUangRepresentasi data={data} optionsPejabat={optionsPejabat} />
    </div>
  );
};

export default SbmUangRepresentasiPage;
