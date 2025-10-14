import React from "react";
import Link from "next/link";
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaThumbsUp,
  FaComments,
  FaShareAlt,
  FaSignOutAlt,
  FaMoon,
} from "react-icons/fa";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="sidebar-header text-white text-2xl font-semibold uppercase">
        Codinglab
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/admin/dashboard">
              <FaHome className="inline-block mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/content">
              <FaFileAlt className="inline-block mr-2" />
              Content
            </Link>
          </li>
          <li>
            <Link href="/admin/analytics">
              <FaChartBar className="inline-block mr-2" />
              Analytics
            </Link>
          </li>
          <li>
            <Link href="/admin/likes">
              <FaThumbsUp className="inline-block mr-2" />
              Likes
            </Link>
          </li>
          <li>
            <Link href="/admin/comments">
              <FaComments className="inline-block mr-2" />
              Comments
            </Link>
          </li>
          <li>
            <Link href="/admin/share">
              <FaShareAlt className="inline-block mr-2" />
              Share
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-bottom">
        <div className="logout-section">
          <Link href="/logout">
            <FaSignOutAlt className="inline-block mr-2" />
            Logout
          </Link>
        </div>
        <div className="dark-mode-toggle">
          <FaMoon className="inline-block mr-2" />
          Dark Mode
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
