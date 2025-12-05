"use client";

import { CloudUpload } from "lucide-react";

interface UploadAreaProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadArea({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
}: UploadAreaProps) {
  return (
    <div
      className={`pdf-upload-area border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <label className="cursor-pointer flex flex-col items-center gap-2">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={onFileInput}
          className="hidden"
        />
        <CloudUpload size={48} className="text-gray-500" />
        <div className="upload-text text-gray-700 font-medium">
          {isDragging ? "วางไฟล์ที่นี่" : "คลิกหรือลากไฟล์มาที่นี่"}
        </div>
        <div className="upload-hint text-gray-400 text-sm">
          รองรับไฟล์ PDF เท่านั้น
        </div>
      </label>
    </div>
  );
}
