import React from 'react';

export default function AdminFooter() {
  return (
    <div className="admin-footer">
      <p>&copy; {new Date().getFullYear()} Admin Dashboard</p>
    </div>
  );
}