import { cn } from "@/lib/utils";
import { CircleX, Eye, List, Minimize2 } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { FormLabel } from "../ui/form";

interface FormMultiFileUploadProps {
  name: string;
  onFileChange?: (files: File[] | null) => void;
  className?: string;
  classNameEyeButton?: string;
  text?: string;
}

export const FormMultiFileUpload = ({
  name,
  onFileChange,
  className,
  classNameEyeButton,
  text = "Add Files",
}: FormMultiFileUploadProps) => {
  const { control, watch, setValue, trigger } = useFormContext();
  const [showFiles, setShowFiles] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Watch the field value to display previously saved files
  const currentFiles = (watch(name) as File[] | undefined) || [];

  // Function to reset the input value
  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Function to handle file selection and merge with existing files
  const handleFileChange = (newFiles: File[] | null) => {
    if (newFiles) {
      // Combine new files with existing files, avoiding duplicates
      const updatedFiles = [
        ...currentFiles,
        ...newFiles.filter(
          (newFile) =>
            !currentFiles.some(
              (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
            )
        ),
      ];

      setValue(name, updatedFiles);

      onFileChange && onFileChange(updatedFiles);
    }
    resetInput();
    trigger(name);
  };

  // Function to handle file deletion
  const handleDeleteFile = (index: number) => {
    if (currentFiles) {
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      setValue(name, updatedFiles);
      onFileChange && onFileChange(updatedFiles);
    }
    trigger(name);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        id={name}
        type="file"
        accept="image/*, application/pdf"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : null;
          handleFileChange(files);
        }}
      />

      <div className="flex flex-row gap-1 items-center">
        <Button
          type="button"
          variant={"outline"}
          className={cn("shadow-lg border-2 border-gray-300", className)}
          onClick={() => inputRef.current?.click()}
        >
          {text}
        </Button>

        {currentFiles && currentFiles?.length > 0 && (
          <Button
            type="button"
            variant={
              showFiles && currentFiles && currentFiles.length > 0
                ? "outline"
                : "outline"
            }
            onClick={() => setShowFiles(!showFiles)}
            className={cn(
              "shadow-lg border-2 border-gray-300",
              classNameEyeButton
            )}
          >
            <span className="mx-2">{currentFiles.length} file</span>
            <List
              size={16}
              className="text-blue-900"
              transform={showFiles ? "rotate(0)" : "rotate(90)"}
            />
          </Button>
        )}
      </div>

      {showFiles && currentFiles && currentFiles.length > 0 && (
        <div className="flex flex-col gap-1 w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
          {currentFiles.map((file, index) => (
            <div
              key={index}
              className="flex flex-row gap-1 items-center p-1 hover:bg-red-400"
            >
              <span className="flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeleteFile(index)}
                className="rounded-full p-1"
              >
                <CircleX size={24} className="text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
