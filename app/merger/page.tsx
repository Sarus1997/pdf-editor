"use client";

import { useState } from "react";
import type { PDFFile } from "./../types";
import PdfList from "./../components/PdfList";
import UploadArea from "./UploadArea";
import { mergePDFs } from "../utils/mergePDFs";
import { FileEdit, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MergerPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles)
      .filter((f) => f.type === "application/pdf")
      .map((file, index) => ({
        id: uid(),
        file,
        name: file.name,
        order: files.length + index,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const downloadMerged = async () => {
    const blob = await mergePDFs(files.map((f) => f.file));
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pdf-merger-container">
      <Link href="/" className="flex items-center gap-2 mb-4">
        <ArrowLeft size={20} /> กลับหน้าแรก
      </Link>

      <div className="pdf-header">
        <h1 className="flex items-center gap-2">
          <FileEdit size={32} />
          PDF Merger
        </h1>
        <p>อัปโหลดและรวมไฟล์ PDF ได้ง่ายๆ</p>
      </div>

      <div className="pdf-main-card">
        <UploadArea
          isDragging={isDragging}
          onDrop={(e: { preventDefault: () => void; dataTransfer: { files: FileList | null; }; }) => {
            e.preventDefault();
            setIsDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
          onDragOver={(e: { preventDefault: () => void; }) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e: { preventDefault: () => void; }) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onFileInput={(e: { target: { files: FileList | null; }; }) => handleUpload(e.target.files)}
        />

        <PdfList files={files} setFiles={setFiles} />

        <div className="pdf-action-buttons">
          <button
            onClick={downloadMerged}
            className="merge-btn flex items-center gap-2"
            disabled={files.length === 0}
          >
            <Download size={20} /> รวมและดาวน์โหลด PDF
          </button>
        </div>
      </div>
    </div>
  );
}
