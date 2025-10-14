import React from "react";

export default function AdminHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50  shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <img
            src="/ajitkumarpandit/AJITKUMARPANDIT_LOGO.png"
            alt="Logo"
            className="h-8 w-full mr-2"
          />
        </div>
      </div>
    </div>
  );
}
