"use client";

import { useState } from "react";
import type { PDFFile } from "../types";
import PdfList from "../components/PdfList";
import UploadArea from "./UploadArea";
import { compressPDF } from "../utils/compressPDFs";
import { FileEdit, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function CompressorPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState(70);

  const handleUpload = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const pdfFiles = Array.from(selectedFiles).filter(
      (f) => f.type === "application/pdf"
    );

    // จำกัด 5 ไฟล์
    if (files.length + pdfFiles.length > 5) {
      alert("อัปโหลดได้สูงสุด 5 ไฟล์เท่านั้น");
      return;
    }

    const newFiles = pdfFiles.map((file, index) => ({
      id: uid(),
      file,
      name: file.name,
      order: files.length + index,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const downloadAllCompressed = async () => {
    for (const f of files) {
      const blob = await compressPDF(f.file, compressionLevel);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${f.name}`;
      a.click();

      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="pdf-merger-container">
      <Link href="/" className="flex items-center gap-2 mb-4">
        <ArrowLeft size={20} /> กลับหน้าแรก
      </Link>

      <div className="pdf-header">
        <h1 className="flex items-center gap-2">
          <FileEdit size={32} />
          PDF Compressor
        </h1>
        <p>อัปโหลดและบีบอัดไฟล์ PDF ได้ง่ายๆ (สูงสุด 5 ไฟล์)</p>
      </div>

      <div className="pdf-main-card">
        <UploadArea
          isDragging={isDragging}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onFileInput={(e) => handleUpload(e.target.files)}
        />

        <PdfList files={files} setFiles={setFiles} />

        <div className="w-full mb-4">
          <label className="block mb-2 font-medium">
            เลือกเปอร์เซ็นต์การบีบอัด: {compressionLevel}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            (เปอร์เซ็นต์ยิ่งต่ำ ไฟล์ยิ่งเล็ก แต่คุณภาพลดลง)
          </p>
        </div>

        <div className="pdf-action-buttons">
          <button
            onClick={downloadAllCompressed}
            className="merge-btn flex items-center gap-2"
            disabled={files.length === 0}
          >
            <Download size={20} />
            บีบอัดและดาวน์โหลดทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
