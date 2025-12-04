"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { PDFFile } from "../types";
import PdfItem from "./PdfItem";

interface Props {
  files: PDFFile[];
  setFiles: React.Dispatch<React.SetStateAction<PDFFile[]>>;
}

export default function PdfList({ files, setFiles }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(files, oldIndex, newIndex);
      setFiles(reordered.map((f, i) => ({ ...f, order: i })));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) =>
      prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i }))
    );
  };

  return (
    <div>
      <div className="pdf-list-header">
        <h2>ไฟล์ทั้งหมด ({files.length})</h2>
        {files.length > 0 && (
          <button
            className="uk-button uk-button-link clear-btn"
            onClick={() => setFiles([])}
          >
            <span uk-icon="icon: trash"></span>
            ลบทั้งหมด
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="pdf-empty-state">
          <span uk-icon="icon: file-text; ratio: 4"></span>
          <p>ยังไม่มีไฟล์</p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={files.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {files.map((file) => (
                <PdfItem
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}