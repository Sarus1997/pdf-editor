"use client";

import React from "react";
import { Annotation } from "../types";

interface Props {
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function AnnotationsList({
  annotations, selectedAnnotation, onSelectAnnotation, onDeleteAnnotation
}: Props) {

  return (
    <div className="annotations-list">
      <h3>Annotations</h3>

      {annotations.map(a => (
        <div
          key={a.id}
          className={`annotation-row ${selectedAnnotation === a.id ? "active" : ""}`}
          onClick={() => onSelectAnnotation(a.id)}
        >
          <span>{a.type}</span>
          <button onClick={() => onDeleteAnnotation(a.id)}>ลบ</button>
        </div>
      ))}
    </div>
  );
}
