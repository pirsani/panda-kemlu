import {
  getOptionsOrganisasi,
  getOptionsSatkerAnggaran,
} from "@/actions/organisasi";
import { getOptionsJenisJabatanPerbendaharaan } from "@/actions/pejabat-perbendaharaan";

import {
  convertPejabatPerbendaharaanToStringDate,
  getPejabatPerbenaharaanBySatkerId,
} from "@/data/pejabat-perbendaharaan";
import DialogFormPejabatPerbendaharaan from "./_components/dialog-form-pejabat-perbendaharaan";
import PejabatPerbendaharaanContainer from "./_components/pejabat-perbendaharaan-container";
import { TabelPejabatPerbendaharaan } from "./_components/tabel-pejabat-perbendaharaan";

const ReferensiPejabataPerbendaharaanPage = async () => {
  const data = await getPejabatPerbenaharaanBySatkerId({});
  const convertedData = convertPejabatPerbendaharaanToStringDate(data);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">
        Tabel Referensi &gt; Pejabat Penanggung Jawab Pengelola Keuangan
      </h1>
      <PejabatPerbendaharaanContainer data={convertedData} />
    </div>
  );
};

export default ReferensiPejabataPerbendaharaanPage;
