"use client";

import { useState } from "react";
import type { PDFFile } from "./types";
import PdfList from "./components/PdfList";
import { mergePDFs } from "./utils/pdfUtils";

// Icons (แทน uk-icon)
import { FileEdit, CloudUpload, Download } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Page() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: PDFFile[] = Array.from(selectedFiles)
      .filter((file) => file.type === "application/pdf")
      .map((file, index) => ({
        id: uid(),
        file,
        name: file.name,
        order: files.length + index,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(event.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const downloadMerged = async () => {
    try {
      const blob = await mergePDFs(files.map((f) => f.file));
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดขณะรวมไฟล์ PDF");
    }
  };

  return (
    <div className="pdf-merger-container">
      {/* Header */}
      <div className="pdf-header">
        <h1 className="flex items-center gap-2">
          <FileEdit size={32} />
          PDF Merger
        </h1>
        <p>อัปโหลด จัดเรียง และรวมไฟล์ PDF ได้อย่างง่ายดาย</p>
      </div>

      {/* Main Card */}
      <div className="pdf-main-card">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`pdf-upload-area ${isDragging ? "dragging" : ""}`}
        >
          <label style={{ cursor: "pointer", display: "block" }}>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-2">
              <CloudUpload size={48} />
              <div className="upload-text">
                {isDragging ? "วางไฟล์ที่นี่" : "คลิกหรือลากไฟล์มาที่นี่"}
              </div>
              <div className="upload-hint">รองรับไฟล์ PDF เท่านั้น</div>
            </div>
          </label>
        </div>

        {/* File List */}
        <PdfList files={files} setFiles={setFiles} />

        {/* Action Button */}
        <div className="pdf-action-buttons">
          <button
            className="merge-btn flex items-center gap-2"
            onClick={downloadMerged}
            disabled={files.length === 0}
          >
            <Download size={20} />
            รวมและดาวน์โหลด PDF
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="pdf-tips">
        <p>
          <strong>💡 เคล็ดลับ:</strong> ลากไฟล์เพื่อจัดเรียงลำดับ หรืออัปโหลดด้วยการลากไฟล์มาวางในกรอบด้านบน
        </p>
      </div>
    </div>
  );
}
