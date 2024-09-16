import { getOptionsProvinsi } from "@/actions/sbm";
import getReferensiSbmUhDalamNegeri from "@/data/sbm-uh-dalam-negeri";
import FormUploadExcelSbmUhDalamNegeri from "./_components/form-upload-excel-sbm-uh-dalam-negeri";
import { TabelSbmUhDalamNegeri } from "./_components/tabel-sbm-uh-dalam-negeri";

const ReferensiSbmUhDalamNegeriPage = async () => {
  const data = await getReferensiSbmUhDalamNegeri();
  const convertedData = data.map((item) => ({
    ...item,
    fullboard: item.fullboard.toNumber(),
    fulldayHalfday: item.fulldayHalfday.toNumber(),
    luarKota: item.luarKota.toNumber(),
    dalamKota: item.dalamKota.toNumber(),
    diklat: item.diklat.toNumber(),
  }));

  const optionsProvinsi = await getOptionsProvinsi();
  // const optionsProvinsi = [
  //   { value: "Aceh", label: "Aceh" },
  //   { value: "Sumatera Utara", label: "Sumatera Utara" },
  // ];

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1 className="m-2">Tabel Referensi &gt; SBM Honorarium </h1>
      <FormUploadExcelSbmUhDalamNegeri />
      <TabelSbmUhDalamNegeri
        data={convertedData}
        optionsProvinsi={optionsProvinsi}
      />
    </div>
  );
};

export default ReferensiSbmUhDalamNegeriPage;
