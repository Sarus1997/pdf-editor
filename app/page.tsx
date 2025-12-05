"use client";

import Link from "next/link";
import { FileEdit, Scissors, FileDown } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import "./HomePage.scss";

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <div className="home-container">
      <h1 className="title">
        {lang === "en" ? "PDF Tools" : "เครื่องมือ PDF"}
      </h1>

      <p className="subtitle">
        {lang === "en" ? "Choose a tool to get started" : "เลือกเครื่องมือที่ต้องการใช้งาน"}
      </p>

      <div className="tool-grid">
        {/* Merge PDF */}
        <Link href="/merger" className="tool-card">
          <div className="icon-wrapper">
            <FileEdit size={48} />
          </div>
          <h2 className="tool-title">
            {lang === "en" ? "Merge PDF" : "รวม PDF"}
          </h2>
          <p className="tool-desc">
            {lang === "en"
              ? "Combine multiple PDF files into one"
              : "รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว"}
          </p>
        </Link>

        {/* Split PDF */}
        <div className="tool-card disabled">
          <div className="icon-wrapper">
            <Scissors size={48} />
          </div>
          <h2 className="tool-title">
            {lang === "en" ? "Split PDF (coming soon)" : "แยก PDF (กำลังพัฒนา)"}
          </h2>
        </div>

        {/* Compress PDF */}
        <Link href="/compress" className="tool-card">
          <div className="icon-wrapper">
            <FileDown size={48} />
          </div>
          <h2 className="tool-title">
            {lang === "en" ? "Compress PDF" : "บีบอัด PDF"}
          </h2>
          <p className="tool-desc">
            {lang === "en"
              ? "Reduce the file size of your PDFs"
              : "ลดขนาดไฟล์ PDF ของคุณ"}
          </p>
        </Link>
      </div>
    </div>
  );
}
