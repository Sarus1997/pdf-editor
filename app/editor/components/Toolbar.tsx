"use client";

import React from "react";
import { AnnotationType } from "../types";

interface Props {
  mode: AnnotationType | "select" | "view";
  setMode: (mode: AnnotationType | "select" | "view") => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function Toolbar(props: Props) {
  return (
    <div className="toolbar-container">
      <div className="tool-group">
        <button onClick={() => props.setMode("select")}
          className={props.mode === "select" ? "active" : ""}>Select</button>

        <button onClick={() => props.setMode("text")}
          className={props.mode === "text" ? "active" : ""}>Text</button>

        <button onClick={() => props.setMode("highlight")}
          className={props.mode === "highlight" ? "active" : ""}>Highlight</button>

        <button onClick={() => props.setMode("rectangle")}
          className={props.mode === "rectangle" ? "active" : ""}>Rect</button>

        <button onClick={() => props.setMode("circle")}
          className={props.mode === "circle" ? "active" : ""}>Circle</button>

        <button onClick={() => props.setMode("freehand")}
          className={props.mode === "freehand" ? "active" : ""}>Freehand</button>
      </div>

      <div className="tool-group">
        <button disabled={!props.canUndo} onClick={props.onUndo}>Undo</button>
        <button disabled={!props.canRedo} onClick={props.onRedo}>Redo</button>
      </div>

      <div className="tool-group">
        <button onClick={props.onZoomOut}>-</button>
        <span>{Math.round(props.scale * 100)}%</span>
        <button onClick={props.onZoomIn}>+</button>
        <button onClick={props.onFitToWidth}>Fit</button>
      </div>
    </div>
  );
}
