import { getOptionsNegara, getOptionsProvinsi } from "@/actions/sbm";
import getReferensiSbmUhLuarNegeri, {
  SbmUhLuarNegeriPlainObject,
} from "@/data/sbm-uh-luar-negeri";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import FormUploadExcelSbmUhLuarNegeri from "./_components/form-upload-excel-sbm-uh-luar-negeri";
import { TabelSbmUhLuarNegeri } from "./_components/tabel-sbm-uh-luar-negeri";

const ReferensiSbmUhLuarNegeriPage = async () => {
  const data = await getReferensiSbmUhLuarNegeri();
  const convertedData = data.map((item) => ({
    ...convertSpecialTypesToPlain<SbmUhLuarNegeriPlainObject>(item),
  }));

  const optionsNegara = await getOptionsNegara();
  // const optionsProvinsi = [
  //   { value: "Aceh", label: "Aceh" },
  //   { value: "Sumatera Utara", label: "Sumatera Utara" },
  // ];

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM UH Luar Negeri </h1>
      <FormUploadExcelSbmUhLuarNegeri />
      <TabelSbmUhLuarNegeri
        data={convertedData}
        optionsNegara={optionsNegara}
      />
    </div>
  );
};

export default ReferensiSbmUhLuarNegeriPage;
