import getReferensiSbmHonorarium from "@/data/sbm-honorarum";
import { get } from "lodash";
import FormUploadExcelSbmHonorarium from "./_components/form-upload-excel-sbm-honorarium";
import { TabelSbmHonorarium } from "./_components/tabel-sbm-honorarium";

const ReferensiSbmHonorariumPage = async () => {
  const data = await getReferensiSbmHonorarium();
  const convertedData = data.map((item) => ({
    ...item,
    besaran: item.besaran.toNumber(), // Convert Decimal to number
  }));
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col">
      <h1 className="m-2">Tabel Referensi &gt; SBM Honorarium </h1>
      <FormUploadExcelSbmHonorarium />
      <TabelSbmHonorarium data={convertedData} />
    </div>
  );
};

export default ReferensiSbmHonorariumPage;
