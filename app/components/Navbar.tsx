"use client";

import { useState } from "react";
import Link from "next/link";
import "./navbar.scss";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="sidebar-toggle"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <Link href="/" className="navbar-logo">
              <span className="logo-icon">📄</span>
              <span className="logo-text">PDF Merger</span>
            </Link>
          </div>

          <div className="navbar-right">
            <ul className="navbar-nav">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
