"use client";
import { useState } from "react";
import { toast } from "sonner";
import DialogFormItinerary from "./dialog-form-itinerary";
import FormItinerary from "./form-itinerary";
import TabelItinerary, { Itinerary } from "./tabel-itinerary";

const ItineraryContainer = () => {
  const [data, setData] = useState<Itinerary[]>([]);
  const handleFormSubmit = (data: Itinerary) => {
    toast.info(
      `Menyimpan data itinerary dari ${data.dariLokasi} ke ${data.keLokasi}`
    );
    setData((prev) => [...prev, data]);
    return true;
  };
  const handleDelete = (row: Itinerary) => {
    setData((prev) => prev.filter((r) => r !== row));
  };
  return (
    <div className="w-full flex-grow flex flex-col">
      <DialogFormItinerary handleFormSubmit={handleFormSubmit} />
      <div className="flex-grow overflow-auto">
        <TabelItinerary data={data} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default ItineraryContainer;
