import axios, { CancelTokenSource } from "axios";

export function returnFileSize(number: number) {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
}

export async function uploadFile(
  file: File,
  onCompleted: ((file: File) => void) | undefined,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);

  try {
    const response = await axios.post("/api/upload", formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      },
    });

    setIsUploading(false);
    if (onCompleted) onCompleted(file);
  } catch (error) {
    setIsUploading(false);
    console.error("Upload failed:", error);
  }
}

export async function uploadChunkedFile(
  file: File,
  onCompleted: ((file: File) => void) | undefined,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Implement chunked file upload logic here
}

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

export function cancelUpload() {
  // Implement cancel upload logic here
}
