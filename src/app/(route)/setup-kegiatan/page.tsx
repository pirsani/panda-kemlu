import { Form } from "react-hook-form";
import SetupKegiatanContainer from "./_components/setup-kegiatan-container";

const SetupKegiatanPage = () => {
  return (
    <div className="p-4 h-full w-full bg-gray-200">
      <div className="flex flex-col w-full lg:w-2/3">
        <SetupKegiatanContainer />
      </div>
    </div>
  );
};

export default SetupKegiatanPage;
