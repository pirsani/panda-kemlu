import useFileStore from "@/hooks/use-file-store";
import { Eye } from "lucide-react";
import { Button } from "./ui/button";

interface ButtonEyeProps {
  url: string;
}
const ButtonEye = ({ url }: ButtonEyeProps) => {
  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };
  return (
    <Button variant={"outline"} className="border-blue-500" onClick={setUrl}>
      <Eye size={16} className="text-blue-900" />
    </Button>
  );
};

export default ButtonEye;
