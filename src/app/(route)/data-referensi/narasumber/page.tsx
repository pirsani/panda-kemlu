import getNarasumber from "@/data/narasumber";
import FormNarasumberContainer from "./_components/form-narasumber-container";
import FormUploadExcelNarasumber from "./_components/form-upload-excel-narasumber";
import { TabelNarasumber } from "./_components/tabel-narasumber";

const ReferensiNarasumberPage = async () => {
  const narasumber = await getNarasumber(); // this will include Date Object so we need to convert it to string first before sending it to the client component

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Narasumber </h1>
      <FormNarasumberContainer data={narasumber} />
      {/* <FormUploadExcelNarasumber /> */}
    </div>
  );
};

export default ReferensiNarasumberPage;
