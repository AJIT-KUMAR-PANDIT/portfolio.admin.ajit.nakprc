import React from "react";
import AdminHeader from "@/components/admin/AdminHeader";
// import AdminSidebar from "@/components/admin/AdminSidebar";
import Dock from "@/components/Dock/Dock";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen ">
      {/* <AdminSidebar /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto  p-4 mt-16">
          {children}
        </main>
        <Dock />
      </div>
    </div>
  );
}
