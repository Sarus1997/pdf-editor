"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PdfViewer, { PdfViewerHandle } from "./components/PdfViewer";
import Toolbar from "./components/Toolbar";
import CanvasOverlay from "./components/CanvasOverlay";
import AnnotationsList from "./components/AnnotationsList";
import { Annotation, AnnotationType } from "./types/index";
import "./styles/editor.scss";
import "./styles/toolbar.scss";
import "./styles/annotations.scss";

export default function PdfEditor() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [mode, setMode] = useState<"view" | "select" | AnnotationType>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1131 });
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  // Refs
  const viewerRef = useRef<PdfViewerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      const url = URL.createObjectURL(uploadedFile);
      setPdfUrl(url);
      setAnnotations([]);
      setCurrentPage(1);
      setSelectedAnnotation(null);

      setUndoStack([[]]);
      setRedoStack([]);
    }
  };

  // Add new annotation
  const addAnnotation = useCallback((type: AnnotationType, x: number, y: number) => {
    const id = `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const baseAnnotation: Annotation = {
      id,
      type,
      page: currentPage,
      x,
      y,
      color: type === "highlight" ? "#FFFF00" :
        type === "text" ? "#000000" : "#FF0000",
      fontSize: type === "text" ? 14 : undefined,
      fontFamily: "Sarabun",
      strokeWidth: 2,
      opacity: type === "highlight" ? 0.3 : 1,
    };

    // Add type-specific properties
    if (type === "text") {
      baseAnnotation.text = "คลิกเพื่อแก้ไขข้อความ";
      baseAnnotation.width = 200;
      baseAnnotation.height = 24;
    } else if (type === "rectangle" || type === "circle") {
      baseAnnotation.width = 200;
      baseAnnotation.height = 150;
    } else if (type === "freehand") {
      baseAnnotation.points = [{ x, y }];
    }

    // Save current state to undo stack
    setUndoStack(prev => [...prev, annotations]);

    // Add new annotation
    setAnnotations(prev => [...prev, baseAnnotation]);
    setSelectedAnnotation(id);
    setMode("select");
  }, [currentPage, annotations]);

  // Update annotation
  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setUndoStack(prev => [...prev, annotations]);
    setAnnotations(prev =>
      prev.map(anno =>
        anno.id === id ? { ...anno, ...updates } : anno
      )
    );
  }, [annotations]);

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    setUndoStack(prev => [...prev, annotations]);
    setAnnotations(prev => prev.filter(anno => anno.id !== id));
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null);
    }
  }, [annotations, selectedAnnotation]);

  // Undo/Redo
  const handleUndo = () => {
    if (undoStack.length > 1) {
      const prevAnnotations = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      setRedoStack(prev => [...prev, annotations]);
      setUndoStack(newUndoStack);
      setAnnotations(prevAnnotations);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextAnnotations = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      setUndoStack(prev => [...prev, annotations]);
      setRedoStack(newRedoStack);
      setAnnotations(nextAnnotations);
    }
  };

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedAnnotation(null);
    }
  };

  // Scale controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const fitToWidth = () => {
    if (containerRef.current && canvasSize.width > 0) {
      const containerWidth = containerRef.current.clientWidth - 100;
      const newScale = containerWidth / canvasSize.width;
      setScale(Math.min(newScale, 3));
    }
  };

  // Handle canvas interaction
  const handleCanvasClick = (x: number, y: number) => {
    if (mode !== "view" && mode !== "select") {
      addAnnotation(mode, x, y);
    }
  };

  // Export PDF
  const exportPDF = async () => {
    if (!file || !pdfUrl) return;

    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Embed font only once
      const helveticaFont = await pdfDoc.embedFont("Helvetica");

      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        if (!page) continue;

        const pdfWidth = page.getWidth();
        const pdfHeight = page.getHeight();

        const x = (annotation.x / 100) * pdfWidth;
        const y = pdfHeight - (annotation.y / 100) * pdfHeight;

        const color = annotation.color || "#000000";
        const rgbColor = hexToRgb(color);

        // Text
        if (annotation.type === "text" && annotation.text) {
          page.drawText(annotation.text, {
            x,
            y,
            size: annotation.fontSize || 14,
            color: rgbColor,
            font: helveticaFont,
          });
        }

        // Rectangle
        if (annotation.type === "rectangle" && annotation.width && annotation.height) {
          const width = (annotation.width / 100) * pdfWidth;
          const height = (annotation.height / 100) * pdfHeight;

          page.drawRectangle({
            x,
            y: y - height,
            width,
            height,
            borderColor: rgbColor,
            borderWidth: annotation.strokeWidth || 2,
          });
        }
      }

      // Save & download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };


  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  // Handle document load
  const handleDocumentLoad = (numPages: number) => {
    setTotalPages(numPages);
  };

  const handlePageRender = (pageInfo: { width: number; height: number }) => {
    setCanvasSize({ width: pageInfo.width, height: pageInfo.height });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) handleRedo();
            else handleUndo();
            e.preventDefault();
            break;
          case 'y':
            handleRedo();
            e.preventDefault();
            break;
          case 's':
            exportPDF();
            e.preventDefault();
            break;
          case '=':
          case '+':
            zoomIn();
            e.preventDefault();
            break;
          case '-':
            zoomOut();
            e.preventDefault();
            break;
          case '0':
            fitToWidth();
            e.preventDefault();
            break;
        }
      }

      // Delete selected annotation
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotation) {
          deleteAnnotation(selectedAnnotation);
        }
      }

      // Page navigation
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft') {
        goToPage(currentPage - 1);
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v') {
        setMode("select");
      } else if (e.key.toLowerCase() === 't') {
        setMode("text");
      } else if (e.key.toLowerCase() === 'h') {
        setMode("highlight");
      } else if (e.key.toLowerCase() === 'r') {
        setMode("rectangle");
      } else if (e.key.toLowerCase() === 'c') {
        setMode("circle");
      } else if (e.key.toLowerCase() === 'l') {
        setMode("line");
      } else if (e.key.toLowerCase() === 'a') {
        setMode("arrow");
      } else if (e.key.toLowerCase() === 'p') {
        setMode("freehand");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotation, currentPage, totalPages]);

  return (
    <div className="editor-wrapper">
      <header className="editor-header">
        <div className="container header-content">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF Editor
          </div>

          <div className="header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              เปิดไฟล์ PDF
            </button>

            {file && (
              <button
                onClick={exportPDF}
                className="btn btn-success"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                บันทึก PDF
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container editor-main">
        {!file ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2>PDF Editor</h2>
            <p>อัพโหลดไฟล์ PDF เพื่อเริ่มแก้ไข เพิ่มข้อความ ไฮไลท์ วาดภาพ และหมายเหตุต่างๆ</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-lg"
            >
              เลือกไฟล์ PDF
            </button>
            <p className="file-size-note">รองรับไฟล์ PDF ขนาดสูงสุด 50MB</p>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <Toolbar
                mode={mode}
                setMode={setMode}
                scale={scale}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitToWidth={fitToWidth}
                canUndo={undoStack.length > 1}
                canRedo={redoStack.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            </div>

            <div className="pdf-viewer-container" ref={containerRef}>
              <div className="viewer-controls">
                <div className="page-navigation">
                  <div className="nav-group">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-outline btn-sm"
                    >
                      ก่อนหน้า
                    </button>

                    <div className="input-group">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => goToPage(parseInt(e.target.value))}
                        className="input-field"
                      />
                      <div className="input-hint">จาก {totalPages}</div>
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline btn-sm"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>

                <div className="zoom-controls">
                  <button
                    onClick={zoomOut}
                    className="btn btn-icon"
                    title="Zoom out"
                  >
                    -
                  </button>

                  <div className="zoom-display">
                    {Math.round(scale * 100)}%
                  </div>

                  <button
                    onClick={zoomIn}
                    className="btn btn-icon"
                    title="Zoom in"
                  >
                    +
                  </button>

                  <button
                    onClick={() => setRotation((rot) => (rot + 90) % 360)}
                    className="btn btn-icon"
                    title="Rotate"
                  >
                    ↻
                  </button>

                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={scale * 100}
                    onChange={(e) => setScale(parseInt(e.target.value) / 100)}
                    className="zoom-slider"
                  />
                </div>
              </div>

              <div className="viewer-content">
                <PdfViewer
                  ref={viewerRef}
                  url={pdfUrl}
                  pageNumber={currentPage}
                  scale={scale}
                  rotation={rotation}
                  onDocumentLoad={handleDocumentLoad}
                  onPageRender={handlePageRender}
                />

                <CanvasOverlay
                  width={canvasSize.width}
                  height={canvasSize.height}
                  annotations={annotations.filter(a => a.page === currentPage)}
                  selectedAnnotation={selectedAnnotation}
                  onSelectAnnotation={setSelectedAnnotation}
                  onUpdateAnnotation={updateAnnotation}
                  onClick={handleCanvasClick}
                  mode={mode}
                />
              </div>
            </div>



            <div className="annotations-panel">
              <AnnotationsList
                annotations={annotations.filter(a => a.page === currentPage)}
                selectedAnnotation={selectedAnnotation}
                onSelectAnnotation={setSelectedAnnotation}
                onDeleteAnnotation={deleteAnnotation}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}