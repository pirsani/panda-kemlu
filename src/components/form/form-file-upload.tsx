import { cn } from "@/lib/utils";
import { useRef } from "react";
import {
  Controller,
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface FormFileUploadProps {
  name: string;
  onFileChange?: (
    file: File | null,
    field: ControllerRenderProps<FieldValues, string>
  ) => void;
  className?: string;
  allowedTypes?: string[];

  //ref?: React.RefObject<HTMLInputElement>;
}

export const FormFileUpload = ({
  name,
  onFileChange,
  className,
  allowedTypes = ["application/pdf"],
}: //ref,
FormFileUploadProps) => {
  const { control, watch } = useFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Watch the field value to display previously saved file
  const currentFile = watch(name) as File | undefined;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <div className="flex flex-row gap-1">
              <Input
                name={`fki-${name}`}
                type="text"
                readOnly
                value={currentFile?.name ?? ""}
                placeholder="No file selected, please choose a file"
                onClick={() =>
                  !currentFile ? inputRef.current?.click() : null
                }
              />
              <Button
                variant={"outline"}
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                {currentFile ? "Change" : "Choose File"}
              </Button>
            </div>

            <input
              ref={inputRef}
              id={name}
              type="file"
              accept={allowedTypes.join(", ")}
              className={cn(
                "border-2 border-gray-300 p-2 rounded w-full hidden",
                className
                // currentFile && "hidden"
              )}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                field.onChange(selectedFile);
                onFileChange && onFileChange(selectedFile, field);
              }}
            />
          </>
        )}
      />
    </div>
  );
};

export default FormFileUpload;
