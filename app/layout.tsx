/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect } from "react";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import "uikit/dist/css/uikit.min.css";

import "./globals.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize UIkit safely
  useEffect(() => {
    UIkit.use(Icons);
  }, []);

  return (
    <html lang="th">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
