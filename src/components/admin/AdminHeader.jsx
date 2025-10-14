import React from 'react';
import { FaSearch, FaBars } from 'react-icons/fa';

export default function AdminHeader() {
  return (
    <div className="admin-header">
      <div className="menu-icon">
        <FaBars />
      </div>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search here..." />
      </div>
      <div className="user-profile">
        <img src="/images/user-avatar.png" alt="User Avatar" className="user-avatar" />
      </div>
    </div>
  );
}