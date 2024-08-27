import { Form } from "react-hook-form";
import SetupKegiatanContainer from "./_components/setup-kegiatan-container";

const SetupKegiatanPage = () => {
  return (
    <div className="p-4 h-auto bg-gray-200 flex flex-col">
      <div className="flex-grow w-full lg:w-2/3">
        <SetupKegiatanContainer />
      </div>
    </div>
  );
};

export default SetupKegiatanPage;
