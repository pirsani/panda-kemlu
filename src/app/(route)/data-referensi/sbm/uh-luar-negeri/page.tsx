import { getOptionsNegara, getOptionsProvinsi } from "@/actions/sbm";
import getReferensiSbmUhLuarNegeri from "@/data/sbm-uh-luar-negeri";
import FormUploadExcelSbmUhLuarNegeri from "./_components/form-upload-excel-sbm-uh-luar-negeri";
import { TabelSbmUhLuarNegeri } from "./_components/tabel-sbm-uh-luar-negeri";

const ReferensiSbmUhLuarNegeriPage = async () => {
  const data = await getReferensiSbmUhLuarNegeri();
  const convertedData = data.map((item) => ({
    ...item,
    golonganA: item.golonganA.toNumber(),
    golonganB: item.golonganB.toNumber(),
    golonganC: item.golonganC.toNumber(),
    golonganD: item.golonganD.toNumber(),
  }));

  const optionsNegara = await getOptionsNegara();
  // const optionsProvinsi = [
  //   { value: "Aceh", label: "Aceh" },
  //   { value: "Sumatera Utara", label: "Sumatera Utara" },
  // ];

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
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
