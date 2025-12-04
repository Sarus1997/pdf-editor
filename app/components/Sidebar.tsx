"use client";

import Link from "next/link";
import "./sidebar.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const menuItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/merge", label: "Merge PDF", icon: "📄" },
    { href: "/history", label: "History", icon: "🕒" },
    { href: "/setting", label: "Settings", icon: "⚙️" },
  ];

  return (
    <>
      <div className={`sidebar-wrapper ${open ? "open" : ""}`}>
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Menu</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close menu">
              ✕
            </button>
          </div>

          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="menu-item"
                  onClick={onClose}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer">
            <p>PDF Merger Pro</p>
            <small>Version 1.0.0</small>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
    </>
  );
}
