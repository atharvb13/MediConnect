import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import "./PageLayout.css";

export default function PageLayout({ role, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <FiMenu size={22} />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="app-main">{children}</main>
    </div>
  );
}
