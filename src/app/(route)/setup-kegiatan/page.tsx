import { Form } from "react-hook-form";
import SetupKegiatanContainer from "./_components/setup-kegiatan-container";

const SetupKegiatanPage = () => {
  return (
    <div className="p-4 pb-24 h-auto min-h-full bg-gray-200 flex flex-col">
      <div className="flex-grow w-full xl:w-4/5">
        <SetupKegiatanContainer />
      </div>
    </div>
  );
};

export default SetupKegiatanPage;
