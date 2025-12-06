"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  url: string;
}

export default function PdfViewer({ url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const renderPdf = async () => {
      try {
        const pdfjs = await import('react-pdf').then(m => m.pdfjs);

        // Setup worker - ใช้ CDN ที่ match version
        pdfjs.GlobalWorkerOptions.workerSrc =
          `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas: canvas,
        }).promise;

        setLoading(false);
      } catch (error) {
        console.error("Error rendering PDF:", error);
        setLoading(false);
      }
    };

    renderPdf();
  }, [url]);

  return (
    <div>
      {loading && <div>Loading PDF...</div>}
      <canvas ref={canvasRef} className="border rounded" />
    </div>
  );
}