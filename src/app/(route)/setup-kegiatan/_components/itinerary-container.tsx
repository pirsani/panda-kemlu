import FormItinerary from "./form-itinerary";
import TabelItinerary from "./tabel-itinerary";

const ItineraryContainer = () => {
  return (
    <div className="w-full">
      <TabelItinerary />
      <FormItinerary />
    </div>
  );
};

export default ItineraryContainer;
