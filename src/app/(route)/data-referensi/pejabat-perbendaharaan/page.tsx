import {
  getOptionsOrganisasi,
  getOptionsSatkerAnggaran,
} from "@/actions/organisasi";
import { getOptionsJenisJabatanPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import FormPejabatPerbendaharaanContainer from "@/approute/data-referensi/pejabat-perbendaharaan/_components/form-pejabat-perbendaharaan-container";
import {
  convertPejabatPerbendaharaanToStringDate,
  getPejabatPerbenaharaanBySatkerId,
} from "@/data/pejabat-perbendaharaan";
import { TabelPejabatPerbendaharaan } from "./_components/tabel-pejabat-perbendaharaan";

const ReferensiPejabataPerbendaharaanPage = async () => {
  const data = await getPejabatPerbenaharaanBySatkerId({});
  const convertedData = convertPejabatPerbendaharaanToStringDate(data);
  const optionsJenisJabatan = await getOptionsJenisJabatanPerbendaharaan();
  const optionsSatker = await getOptionsSatkerAnggaran();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1 className="m-2">Tabel Referensi &gt; Pejabat Perbendaharaan</h1>
      <FormPejabatPerbendaharaanContainer />
      <TabelPejabatPerbendaharaan
        data={convertedData}
        optionsJenisJabatan={optionsJenisJabatan}
        optionsSatker={optionsSatker}
      />
    </div>
  );
};

export default ReferensiPejabataPerbendaharaanPage;
