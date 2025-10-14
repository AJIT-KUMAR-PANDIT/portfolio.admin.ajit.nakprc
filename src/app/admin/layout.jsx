import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import "../../styles/admin.scss";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen admin-layout-container">
      <AdminSidebar />
      <main className="flex flex-col flex-1 admin-main-content">
        <AdminHeader />
        <div className="flex-1 p-4 admin-content-area">{children}</div>
        <AdminFooter />
      </main>
    </div>
  );
}
