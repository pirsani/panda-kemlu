"use client";
import Dropzone from "@/components/dropzone";
import axios from "axios";
import { ParseResult } from "papaparse";
import { useCallback, useState } from "react";
import { DropzoneOptions, FileRejection } from "react-dropzone";
import { toast } from "sonner";
import ListFiles from "./list-files";

interface FilesDropzoneProps {
  onCompleteParse?: (result: ParseResult<unknown>) => void;
}

const FilesDropzone = ({ onCompleteParse }: FilesDropzoneProps) => {
  const [errorCount, setErrorCount] = useState(0);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const handleOnDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("on drop called");
      setErrorCount(0);

      //check if acceptedFiles is already on droppedFiles
      const newFiles = acceptedFiles.filter(
        (file) => !droppedFiles.some((f) => f.name === file.name)
      );

      if (newFiles.length > 0) {
        setAcceptedFiles(newFiles);
        // Add to existing dropped files
        setDroppedFiles((prev) => {
          return prev ? [...prev, ...newFiles] : newFiles;
        });
      }
    },
    [droppedFiles]
  );

  const handleDelete = async (file: File) => {
    const formData = new FormData();
    formData.append("filename", file.name);
    try {
      const deleted = await axios.delete("/api/upload/delete", {
        data: formData,
      });
      toast.success("File deleted");
    } catch (err) {
      const error = err as Error;
      console.error("Error:", error);
      toast.error("Error deleting file");
    }

    const newFiles = droppedFiles.filter((f) => f.name !== file.name);
    console.log("new files", newFiles);
    setDroppedFiles(newFiles);
  };

  const handleDeleteAll = async () => {
    // Use a loop that supports await
    for (const file of droppedFiles) {
      await handleDelete(file);
    }
    // Clear the state after all deletions are complete
    setDroppedFiles([]);
  };

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    console.log("on drop called");
    setErrorCount(fileRejections.length);
    if (acceptedFiles.length > 0) {
      handleOnDrop(acceptedFiles);
    }
  };

  const handleUpload = async () => {
    // TODO
    console.log("uploading...");
  };

  const option: DropzoneOptions = {
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    noClick: true,
    noKeyboard: true,
  };

  return (
    <div className="w-full h-full">
      <Dropzone
        options={option}
        className="w-full md:w-5/6 min-h-full flex flex-col border-2 border-dashed border-gray-300 rounded-md p-2 items-start justify-start"
      >
        {droppedFiles.length === 0 && (
          <p className="text-muted-foreground">
            Drag and drop some PDF files here
          </p>
        )}

        <ListFiles
          files={droppedFiles}
          handleDelete={handleDelete}
          handleDeleteAll={handleDeleteAll}
        />
      </Dropzone>
      {errorCount > 0 && (
        <div className="error-message">
          <p>
            There are {errorCount} errors in the file. Please fix them before
            uploading.
          </p>
        </div>
      )}
    </div>
  );
};

export default FilesDropzone;
