"use client";

import { useRef } from "react";
import { Annotation } from "../types";

interface Props {
  width: number;
  height: number;
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onClick: (x: number, y: number) => void;
  mode: string;
}

export default function CanvasOverlay({
  width, height, annotations, selectedAnnotation, onSelectAnnotation, onUpdateAnnotation, onClick, mode
}: Props) {

  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / width) * 100;
    const y = ((e.clientY - rect.top) / height) * 100;

    onClick(x, y);
  };

  return (
    <div
      ref={overlayRef}
      className="canvas-overlay"
      style={{ width, height }}
      onClick={handleClick}
    >
      {annotations.map(a => (
        <div
          key={a.id}
          className={`annotation-item ${selectedAnnotation === a.id ? "selected" : ""}`}
          style={{
            position: "absolute",
            left: `${a.x}%`,
            top: `${a.y}%`,
            width: a.width ? `${a.width}%` : 10,
            height: a.height ? `${a.height}%` : 10,
            border: a.type !== "text" ? "2px solid red" : "none",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectAnnotation(a.id);
          }}
        >
          {a.type === "text" && (
            <div style={{ fontSize: a.fontSize, color: a.color }}>
              {a.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
