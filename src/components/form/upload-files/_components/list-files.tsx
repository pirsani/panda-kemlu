import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
//import FileItem from "./file-item";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import FileItem from "./file-item";

interface ListFilesProps {
  files?: File[];
  handleDelete?: (file: File) => Promise<void> | void;
  handleDeleteAll?: () => Promise<void> | void;
}

const ListFiles = ({
  files,
  handleDelete,
  handleDeleteAll,
}: ListFilesProps) => {
  const [listOfFiles, setListOfFiles] = useState<File[]>([]);
  const [listOfUploadedFiles, setListOfUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (files) setListOfFiles(files);
  }, [files]);

  const areAllFilesUploaded = useCallback(() => {
    return listOfFiles.every((file) =>
      listOfUploadedFiles.some(
        (uploadedFile) =>
          uploadedFile.name === file.name && uploadedFile.size === file.size
      )
    );
  }, [listOfFiles, listOfUploadedFiles]);

  const removeFromListOfUploadedFiles = useCallback(
    (file: File) => {
      const newFiles = listOfFiles.filter((f) => f.name !== file.name);
      const newUploadedFiles = listOfUploadedFiles.filter(
        (f) => f.name !== file.name
      );
      setListOfFiles(newFiles);
      setListOfUploadedFiles(newUploadedFiles);
      handleDelete && handleDelete(file);
    },
    [listOfFiles, listOfUploadedFiles, handleDelete]
  );

  const handleComplete = useCallback((file: File) => {
    toast.success(`${file.name} Uploaded`);
    setListOfUploadedFiles((prev) => (prev ? [...prev, file] : [file]));
  }, []);

  const handleUpload = useCallback(async () => {
    if (areAllFilesUploaded()) {
      toast.error("All files are already uploaded");
      return;
    }

    setIsUploading(true);
    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success("All files uploaded successfully");
      setListOfUploadedFiles(listOfFiles);
    }, 2000);
  }, [areAllFilesUploaded, listOfFiles]);

  const handleDeleteAllClick = async () => {
    if (handleDeleteAll) {
      try {
        const result = handleDeleteAll();
        if (result instanceof Promise) {
          await result;
        }
        setListOfFiles([]);
        setListOfUploadedFiles([]);
        toast.success("All files deleted");
      } catch (error) {
        toast.error("Failed to delete all files");
      }
    } else {
      setListOfFiles([]);
      setListOfUploadedFiles([]);
      toast.success("All files deleted");
    }
  };

  return (
    <div className="w-full">
      {listOfFiles && listOfFiles.length > 0 && (
        <div className="flex flex-col gap-3 items-end">
          <div className="gap-2 flex">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload All"}
            </Button>
            <Button variant={"destructive"} onClick={handleDeleteAllClick}>
              Delete All
            </Button>
          </div>
          <Separator className="h-[2px]" />
          <div className="w-full">
            {listOfFiles.map((file) => (
              <FileItem
                key={file.name}
                file={file}
                onDelete={removeFromListOfUploadedFiles}
                fired={isUploading}
                onCompleted={handleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFiles;
