"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios, { CancelTokenSource } from "axios";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FileItemProps {
  file: File;
  onDelete?: (file: File) => Promise<void> | void;
  fired?: boolean;
  onCompleted?: (file: File) => void;
}

function returnFileSize(number: number) {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
}

const FileItem = ({ file, onDelete, fired, onCompleted }: FileItemProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [isChunk, setIsChunk] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const [randomString, setRandomString] = useState(
    Math.random().toString(36).substring(2, 15)
  );
  const CHUNK_SIZE = 512 * 1024; // 512 KB

  // Use a ref to persist the cancel token sources
  const cancelTokenSourcesRef = useRef<CancelTokenSource[]>([]);

  useEffect(() => {
    if (fired && isComplete) {
      //toast.success("file uploaded " + file.name);
      return;
    }

    if (fired) {
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fired]);

  // Store cancel token sources
  //const cancelTokenSourcesRef: CancelTokenSource[] = [];

  // Function to create and store a cancel token source
  const createCancelToken = () => {
    const source = axios.CancelToken.source();
    cancelTokenSourcesRef.current.push(source);
    return source;
  };

  const mergeChunks = async () => {
    const formData = new FormData();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    formData.append("filename", file.name);
    formData.append("totalChunks", totalChunks.toString());
    formData.append("randomString", randomString);

    try {
      const cancelTokenSource = createCancelToken();
      const response = await axios.post("/api/upload/merge", formData, {
        cancelToken: cancelTokenSource.token,
      });
      console.log("Merge complete:", file.name);
      setIsComplete(true);
      onCompleted && onCompleted(file);
    } catch (error: any) {
      if (!axios.isCancel(error)) {
        console.error("Merge request failed:", error.message);
        setError(error.message);
        toast.error("Merge request failed");
      } else {
        console.log("Merge request canceled:", error.message);
      }
    }
  };

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);

    const cancelTokenSource = createCancelToken();

    try {
      const response = await axios.post("/api/upload", formData, {
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      setIsComplete(true);
      onCompleted && onCompleted(file);
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Upload request canceled:", error.message);
      } else {
        setError(error.message);
      }
    } finally {
      setIsUploading(false);
    }

    return cancelTokenSource;
  };

  const uploadChunk = async (file: File, randomString: string) => {
    const CHUNK_SIZE = 1024 * 1024; // Define chunk size
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const MAX_CONCURRENT_UPLOADS = 5; // Limit the number of concurrent uploads
    setTotalChunks(totalChunks);
    const cancelTokenSource = createCancelToken();

    let progressArray = new Array(totalChunks).fill(0);

    const updateProgress = () => {
      const totalProgress =
        progressArray.reduce((acc, p) => acc + p, 0) / totalChunks;
      setProgress(Math.round(totalProgress));
    };

    const chunkPromises = [];
    let activeUploads = 0;

    const processChunk = async (idx: number, start: number) => {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      activeUploads++; // Track the number of active uploads
      await uploadIndividualChunk(
        file,
        chunk,
        idx,
        randomString,
        cancelTokenSource
      )
        .then(() => {
          progressArray[idx] = 100 / totalChunks;
          updateProgress();
        })
        .finally(() => {
          activeUploads--; // Decrement active uploads when done
        });
    };

    try {
      for (
        let idx = 0, start = 0;
        start < file.size;
        start += CHUNK_SIZE, idx++
      ) {
        if (activeUploads >= MAX_CONCURRENT_UPLOADS) {
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (activeUploads < MAX_CONCURRENT_UPLOADS) {
                clearInterval(interval);
                resolve(true);
              }
            }, 100); // Poll every 100ms to check if there's room for new uploads
          });
        }

        chunkPromises.push(processChunk(idx, start));
      }

      await Promise.all(chunkPromises); // Wait for all chunks to finish

      await mergeChunks(); // Merge all chunks after uploading
      setProgress(100);
      setIsComplete(true);
    } catch (error: any) {
      if (!axios.isCancel(error)) {
        setError(error.message);
      }
    } finally {
      setIsUploading(false);
    }

    return cancelTokenSource;
  };

  const uploadIndividualChunk = async (
    file: File,
    chunk: Blob,
    idx: number,
    randomString: string,
    cancelToken: any
  ) => {
    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("randomString", randomString);
    formData.append("chunk", chunk);
    formData.append("currentChunk", idx.toString());

    try {
      const response = await axios.post("/api/upload/chunk", formData, {
        cancelToken: cancelToken.token,
      });
      return response;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Chunk upload request canceled:", error.message);
      } else {
        throw error;
      }
    }
  };

  const handleCancel = () => {
    cancelTokenSourcesRef.current.forEach((source, index) => {
      source.cancel(`Operation canceled by the user for request ${index + 1}.`);
    });
    // TODO : cancel upload
    // notify server to delete chunked files that are already uploaded
    //axios.delete("/api/upload/delete", { data: { filename: file.name } });
    console.log("cancel upload");
  };

  const handleDelete = useCallback(async () => {
    if (onDelete) {
      try {
        await onDelete(file);
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }
  }, [file, onDelete]);

  const handleUpload = useCallback(async () => {
    if (isComplete) return;
    setIsUploading(true);
    setIsChunk(file.size > CHUNK_SIZE);
    if (file.size > CHUNK_SIZE) {
      await uploadChunk(file, randomString);
      //await upload();
      //return;
    } else {
      await upload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="flex flex-col w-full gap-2 p-1">
      <div className="flex gap-2">
        <Progress className="w-full h-8" value={progress ? progress : 0} />
        {isComplete ? (
          <Button onClick={handleDelete}>Delete</Button>
        ) : (
          <>
            <Button onClick={handleUpload} disabled={isUploading}>
              Upload
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </>
        )}
      </div>

      <span>{file.name}</span>
      <span>{returnFileSize(file.size)}</span>
    </div>
  );
};

export default FileItem;
