import { Eye } from "lucide-react";
import { Button } from "../ui/button";

interface TextDokumenWithPreviewButtonProps {
  label: string;
  dokumen: string;
}
const TextDokumenWithPreviewButton = ({
  label,
  dokumen,
}: TextDokumenWithPreviewButtonProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-gray-700">{label}</span>
      <div className="flex flex-row">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {dokumen}
        </span>
        <Button variant={"outline"} className="border-blue-500">
          <Eye size={16} className="text-blue-900" />
        </Button>
      </div>
    </div>
  );
};

export default TextDokumenWithPreviewButton;
