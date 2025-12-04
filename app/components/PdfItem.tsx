"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PDFFile } from "../types";

interface Props {
  file: PDFFile;
  onRemove: () => void;
}

export default function PdfItem({ file, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pdf-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="pdf-item-content">
        <div {...attributes} {...listeners} className="drag-handle">
          <span uk-icon="icon: menu; ratio: 1.2"></span>
        </div>
        <span className="file-icon" uk-icon="icon: file-text; ratio: 1.5"></span>
        <div className="file-info">
          <div className="file-name">{file.name}</div>
          <div className="file-size">{Math.round(file.file.size / 1024)} KB</div>
        </div>
      </div>
      <div className="pdf-item-actions">
        <button
          className="uk-button uk-button-link remove-btn"
          onClick={onRemove}
          type="button"
        >
          <span uk-icon="icon: close; ratio: 1.2"></span>
        </button>
      </div>
    </div>
  );
}