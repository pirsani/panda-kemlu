import FormUploadExcelNarasumber from "./_components/form-upload-excel-narasumber";

const ReferensiNarasumberPage = () => {
  return (
    <div className="p-4 pb-24 h-auto min-h-full 200 flex flex-col">
      <div className="flex-grow w-full xl:w-4/5">
        <h1>Referensi Narasumber</h1>
        <FormUploadExcelNarasumber />
      </div>
    </div>
  );
};

export default ReferensiNarasumberPage;
