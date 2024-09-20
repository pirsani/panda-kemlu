import BaseInputDatePicker from "@/components/form/date-picker/base-input-date-picker";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Delete, Edit, Save, Trash } from "lucide-react";
import { useState } from "react";
import SelectSbmNegara from "./select-sbm-negara";

const data = [
  {
    no: 1,
    tanggalMulai: "01 Jan 2024",
    tanggalSelesai: "06 Jan 2024",
    negara: "Prancis",
  },
  {
    no: 2,
    startDate: "01 Jan 2024",
    endDate: "06 Jan 2024",
    negara: "Prancis",
  },
];
const TabelItinerary = () => {
  const rowData = data;
  const labelTh = ["No", "Tanggal Mulai", "Tanggal Akhir", "Negara", "Aksi"];
  return (
    <div className="overflow-x-auto flex-grow">
      <table className="min-w-full bg-white border h-full">
        <thead>
          <tr>
            {labelTh.map((label) => (
              <th
                key={label}
                className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, index) => (
            <RowItinerary key={index} data={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RowItinerary = ({ data }: { data: Record<string, any> }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    setIsEditMode(false);
  };

  return isEditMode ? (
    <RowItineraryEditMode data={data} onSave={handleSave} />
  ) : (
    <RowItineraryViewMode data={data} onEdit={handleEditMode} />
  );
};

const RowItineraryViewMode = ({
  data,
  onEdit,
}: {
  data: Record<string, any>;
  onEdit: () => void;
}) => {
  const handleOnClikcEdit = () => {
    console.log("Edit");
  };
  return (
    <tr>
      {Object.values(data).map((value, idx) => (
        <td key={idx} className="px-4 py-2 border-b border-gray-200 text-sm">
          {value}
        </td>
      ))}
      <td className="px-4 py-2 border-b border-gray-200 text-sm">
        <Button type="button" variant={"ghost"} onClick={onEdit}>
          <Edit size={16} />
        </Button>
        <Button
          type="button"
          variant={"ghost"}
          onClick={() => {
            console.log("Delete");
          }}
        >
          <Trash size={16} />
        </Button>
      </td>
    </tr>
  );
};

const RowItineraryEditMode = ({
  data,
  onSave,
}: {
  data: Record<string, any>;
  onSave: () => void;
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [negara, setNegara] = useState(data.negara);

  const handleChangeNegara = (value: string | null) => {
    if (value) setNegara(value);
  };

  return (
    <tr>
      <td className="px-4 py-2 border-b border-gray-200 text-sm">{data.no}</td>
      <td className="px-4 py-2 border-b border-gray-200 text-sm">
        <BaseInputDatePicker
          onSelect={(date) => setStartDate(date)}
          name="tangalMulai"
          className="border w-36"
        />
      </td>
      <td className="px-4 py-2 border-b border-gray-200 text-sm">
        <BaseInputDatePicker
          onSelect={(date) => setEndDate(date)}
          name="tanggalSelesai"
          className="border w-36"
        />
      </td>
      <td className="px-4 py-2 border-b border-gray-200 text-sm">
        <SelectSbmNegara
          fullKey="negara"
          value={negara}
          onChange={handleChangeNegara}
        />
      </td>
      <td className="px-4 py-2 border-b border-gray-200 text-sm">
        <Button type="button" onClick={onSave}>
          <Save size={16} />
        </Button>
      </td>
    </tr>
  );
};

export default TabelItinerary;
