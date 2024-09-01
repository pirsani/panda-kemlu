"use client";
import useFileStore from "@/hooks/use-file-store";
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
  //const fileUrl = useFileStore((state) => state.fileUrl);

  const url = "/templates/pdf-placeholder.pdf";

  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };

  return (
    <div className="flex flex-col">
      <span className="text-gray-700">{label}</span>
      <div className="flex flex-row">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {dokumen}
        </span>
        <Button
          variant={"outline"}
          className="border-blue-500"
          onClick={setUrl}
        >
          <Eye size={16} className="text-blue-900" />
        </Button>
      </div>
    </div>
  );
};

export default TextDokumenWithPreviewButton;
