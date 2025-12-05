import { PDFDocument } from "pdf-lib";

export async function compressPDF(file: File, compressionLevel = 70): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  const compressedPdf = await PDFDocument.create();

  const copiedPages = await compressedPdf.copyPages(pdf, pdf.getPageIndices());
  copiedPages.forEach((page) => {
    const scale = compressionLevel / 100;
    page.scale(scale, scale);
    compressedPdf.addPage(page);
  });

  const compressedBytes = await compressedPdf.save({
    useObjectStreams: true,
  });

  // 🔥 FIX — convert ArrayBuffer to Uint8Array before creating Blob
  return new Blob([new Uint8Array(compressedBytes)], {
    type: "application/pdf",
  });
}
