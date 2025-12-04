/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect } from "react";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import "uikit/dist/css/uikit.min.css";

import "./globals.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    UIkit.use(Icons);
  }, []);

  return (
    <html lang="th">
      <body>
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
