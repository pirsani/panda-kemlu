import getNarasumber from "@/data/narasumber";
import FormUploadExcelNarasumber from "./_components/form-upload-excel-narasumber";
import { TabelNarasumber } from "./_components/tabel-narasumber";

const ReferensiNarasumberPage = async () => {
  const narasumber = await getNarasumber(); // this will include Date Object so we need to convert it to string first before sending it to the client component

  return (
    <div className="p-4 pb-24 h-auto min-h-full 200 flex flex-col">
      <div className="flex-grow w-full">
        <h1>Referensi Narasumber</h1>
        <TabelNarasumber data={narasumber} />
        <FormUploadExcelNarasumber />
      </div>
    </div>
  );
};

export default ReferensiNarasumberPage;
