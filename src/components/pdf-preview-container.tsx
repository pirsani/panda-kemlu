"use client";

import PdfPreview from "@/components/pdf-preview";
import useFileStore from "@/hooks/use-file-store";

interface PdfPreviewContainerProps {
  className?: string;
}

const PdfPreviewContainer = ({ className }: PdfPreviewContainerProps) => {
  const fileUrl = useFileStore((state) => state.fileUrl);

  return <PdfPreview fileUrl={fileUrl} className={className} />;
};

export default PdfPreviewContainer;
