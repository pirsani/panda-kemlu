import FormItinerary from "./form-itinerary";
import TabelItinerary from "./tabel-itinerary";

const ItineraryContainer = () => {
  return (
    <div className="w-full flex-grow flex flex-col">
      <div className="flex-grow overflow-auto">
        <TabelItinerary />
      </div>

      <FormItinerary />
    </div>
  );
};

export default ItineraryContainer;
