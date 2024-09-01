import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface FormFileUploadProps {
  name: string;
  onFileChange?: (file: File | null) => void;
  className?: string;
  //ref?: React.RefObject<HTMLInputElement>;
}

export const FormFileUpload = ({
  name,
  onFileChange,
  className,
}: //ref,
FormFileUploadProps) => {
  const { control, watch } = useFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Watch the field value to display previously saved file
  const currentFile = watch(name) as File | undefined;

  return (
    <div className="flex flex-col gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {currentFile && (
              <div className="flex flex-row gap-1">
                <Input type="text" readOnly value={currentFile.name} />
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={() => inputRef.current?.click()}
                >
                  Change File
                </Button>
              </div>
            )}
            <input
              ref={inputRef}
              id={name}
              type="file"
              accept=".pdf"
              className={cn(
                "border-2 border-gray-300 p-2 rounded w-full",
                className,
                currentFile && "hidden"
              )}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                field.onChange(selectedFile);
                onFileChange && onFileChange(selectedFile);
              }}
            />
          </>
        )}
      />
    </div>
  );
};

export default FormFileUpload;
