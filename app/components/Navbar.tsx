"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import "./navbar.scss";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();

  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="sidebar-toggle" onClick={() => setOpen(true)}>
              <span></span><span></span><span></span>
            </button>

            <Link href="/" className="navbar-logo">
              <span className="logo-icon">📄</span>
              <span className="logo-text">PDF EDITOR</span>
            </Link>
          </div>

          <div className="navbar-right">
            <ul className="navbar-nav">
              <li><Link href="/">{lang === "en" ? "Home" : "หน้าแรก"}</Link></li>
              <li><Link href="/about">{lang === "en" ? "About" : "เกี่ยวกับ"}</Link></li>
              <li><Link href="/contact">{lang === "en" ? "Contact" : "ติดต่อ"}</Link></li>
            </ul>

            {/* ปุ่มเปลี่ยนภาษาแบบรูปธงจาก public */}
            <button className="lang-switch-btn" onClick={toggleLang}>
              <Image
                src={lang === "en" ? "/img/flag/england.svg" : "/img/flag/thailand.svg"}
                alt="language flag"
                width={28}
                height={20}
                className="flag-img"
              />
            </button>
          </div>
        </div>
      </nav>

      <Sidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
