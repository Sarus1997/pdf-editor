"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

export interface PdfViewerHandle {
  goToPage: (page: number) => void;
}

interface Props {
  url: string;
  pageNumber: number;
  scale: number;
  rotation: number;
  onDocumentLoad: (pages: number) => void;
  onPageRender: (size: { width: number; height: number }) => void;
}

const PdfViewer = forwardRef<PdfViewerHandle, Props>(({
  url, pageNumber, scale, rotation, onDocumentLoad, onPageRender
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  useImperativeHandle(ref, () => ({
    goToPage(page: number) {
      render(page);
    }
  }));

  const render = useCallback(async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return;

    // 清除之前的渲染任务
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      try {
        const page = await pdfRef.current!.getPage(pageNum);
        const viewport = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");

        if (!context || !isMountedRef.current) return;

        // 设置 canvas 尺寸
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // 清除画布
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (isMountedRef.current) {
          onPageRender({ width: viewport.width, height: viewport.height });
        }

        const renderContext = {
          canvasContext: context,
          viewport,
          // 可选：启用文本层支持
          enableTextLayer: false,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Error rendering PDF page:', error);
        }
      }
    }, 16); // ~60fps 的延迟
  }, [scale, rotation, onPageRender]);

  // 加载 PDF 文档
  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url,
          signal: controller.signal,
        });

        const pdf = await loadingTask.promise;

        if (!isMountedRef.current) return;

        pdfRef.current = pdf;

        if (isMountedRef.current) {
          onDocumentLoad(pdf.numPages);
        }

        // 确保页面在有效范围内
        const validPage = Math.min(Math.max(1, pageNumber), pdf.numPages);
        if (isMountedRef.current) {
          render(validPage);
        }
      } catch (error) {
        if (isMountedRef.current && !controller.signal.aborted) {
          console.error('Failed to load PDF:', error);
        }
      }
    };

    loadPDF();

    return () => {
      isMountedRef.current = false;
      controller.abort();

      // 清理 PDF 实例
      if (pdfRef.current) {
        pdfRef.current.destroy();
        pdfRef.current = null;
      }
    };
  }, [url]);

  // 监听页面、缩放和旋转变化
  useEffect(() => {
    if (!pdfRef.current || !isMountedRef.current) return;

    const renderPage = async () => {
      try {
        const numPages = pdfRef.current!.numPages;
        const validPage = Math.min(Math.max(1, pageNumber), numPages);

        if (validPage !== pageNumber && isMountedRef.current) {
          // 如果页面无效，可以通过回调通知父组件
          console.warn(`Invalid page number: ${pageNumber}. Valid range: 1-${numPages}`);
        }

        if (isMountedRef.current) {
          await render(validPage);
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Error in page change effect:', error);
        }
      }
    };

    renderPage();
  }, [pageNumber, scale, rotation, render]);

  // 清理定时器
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="pdf-canvas" />;
});

PdfViewer.displayName = 'PdfViewer';

export default PdfViewer;