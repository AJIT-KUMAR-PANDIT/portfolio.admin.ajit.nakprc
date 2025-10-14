"use client";

import React, { useEffect, useState } from "react";
import { Client, Databases, Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ClipboardCopy,
  Download,
  Search,
  Grid3x3,
  List,
  Table2,
  Mail,
  Phone,
  User,
  Calendar,
  ChevronDown,
} from "lucide-react";

import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_ID,
} from "@/utils/env";

const client = new Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
const databases = new Databases(client);

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all_ranges");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [layoutView, setLayoutView] = useState("tiles");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [
    filter,
    startDate,
    endDate,
    startTime,
    endTime,
    startDay,
    endDay,
    startYear,
    endYear,
  ]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let queries = [Query.orderDesc("$createdAt")];

      const now = new Date();
      let filterStartDate = null;
      let filterEndDate = null;

      switch (filter) {
        case "today":
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "this_week":
          const day = now.getDay();
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - day
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - day + 7
          );
          break;
        case "this_month":
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "this_year":
          filterStartDate = new Date(now.getFullYear(), 0, 1);
          filterEndDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case "past_year":
          filterStartDate = new Date(now.getFullYear() - 1, 0, 1);
          filterEndDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "custom_date":
          if (startDate) {
            filterStartDate = new Date(startDate);
          }
          if (endDate) {
            filterEndDate = new Date(endDate);
            filterEndDate.setDate(filterEndDate.getDate() + 1);
          }
          break;
        case "custom_time":
          break;
        case "custom_days":
          if (startDay && endDay) {
            filterStartDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              parseInt(startDay)
            );
            filterEndDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              parseInt(endDay) + 1
            );
          }
          break;
        case "custom_years":
          if (startYear) {
            filterStartDate = new Date(parseInt(startYear), 0, 1);
          }
          if (endYear) {
            filterEndDate = new Date(parseInt(endYear) + 1, 0, 1);
          }
          break;
        default:
          break;
      }

      if (filterStartDate) {
        queries.push(
          Query.greaterThanEqual("$createdAt", filterStartDate.toISOString())
        );
      }
      if (filterEndDate) {
        queries.push(Query.lessThan("$createdAt", filterEndDate.toISOString()));
      }

      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_TABLE_ID,
        queries
      );
      let filteredMessages = response.documents;

      if (filter === "custom_time" && startTime && endTime) {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        filteredMessages = filteredMessages.filter((message) => {
          const messageDate = new Date(message.$createdAt);
          const messageHour = messageDate.getHours();
          const messageMinute = messageDate.getMinutes();
          const messageTimeInMinutes = messageHour * 60 + messageMinute;
          const startTimeInMinutes = startHour * 60 + startMinute;
          const endTimeInMinutes = endHour * 60 + endMinute;

          return (
            messageTimeInMinutes >= startTimeInMinutes &&
            messageTimeInMinutes <= endTimeInMinutes
          );
        });
      }

      setMessages(filteredMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (message.subject || "").toLowerCase().includes(query) ||
      (message.name || "").toLowerCase().includes(query) ||
      (message.emailAddress || "").toLowerCase().includes(query) ||
      (message.message || "").toLowerCase().includes(query) ||
      (message.phoneNumber || "").toLowerCase().includes(query)
    );
  });

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCSV = () => {
    if (filteredMessages.length === 0) {
      alert("No messages to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email Address",
      "Phone Number",
      "Subject",
      "Message",
      "Submission Date",
    ];
    const csvRows = [headers.join(",")];

    filteredMessages.forEach((message) => {
      const submissionDate = new Date(
        message.submissionDate || message.$createdAt
      ).toLocaleString();
      const row = [
        `"${message.$id}"`,
        `"${(message.name || "").replace(/"/g, '""')}"`,
        `"${(message.emailAddress || "").replace(/"/g, '""')}"`,
        `"${(message.phoneNumber || "").replace(/"/g, '""')}"`,
        `"${(message.subject || "").replace(/"/g, '""')}"`,
        `"${(message.message || "").replace(/"/g, '""')}"`,
        `"${submissionDate}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "inbox_messages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-center">
            <X size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Inbox
              </h1>
              <p className="text-gray-600">
                {filteredMessages.length}{" "}
                {filteredMessages.length === 1 ? "message" : "messages"}
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download size={18} />
              <span className="font-medium">Export CSV</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search messages by name, email, subject, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>

          {/* Filters and Layout Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium cursor-pointer"
              >
                <option value="all_ranges">All Messages</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="past_year">Past Year</option>
                <option value="custom_date">Custom Date Range</option>
                <option value="custom_time">Custom Time Range</option>
                <option value="custom_days">Custom Days Range</option>
                <option value="custom_years">Custom Years Range</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* Custom Date Inputs */}
            {filter === "custom_date" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="focus:outline-none"
                />
              </div>
            )}

            {filter === "custom_time" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="focus:outline-none"
                />
              </div>
            )}

            {filter === "custom_days" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <input
                  type="number"
                  placeholder="Start Day"
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  className="w-24 focus:outline-none"
                  min="1"
                  max="31"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="End Day"
                  value={endDay}
                  onChange={(e) => setEndDay(e.target.value)}
                  className="w-24 focus:outline-none"
                  min="1"
                  max="31"
                />
              </div>
            )}

            {filter === "custom_years" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <input
                  type="number"
                  placeholder="Start Year"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-28 focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="End Year"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="w-28 focus:outline-none"
                />
              </div>
            )}

            {/* Layout View Controls */}
            <div className="flex items-center gap-2 ml-auto bg-white rounded-xl border-2 border-gray-200 shadow-sm p-1">
              <button
                onClick={() => setLayoutView("tiles")}
                className={`p-2 rounded-lg transition-all ${
                  layoutView === "tiles"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setLayoutView("list")}
                className={`p-2 rounded-lg transition-all ${
                  layoutView === "list"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setLayoutView("table")}
                className={`p-2 rounded-lg transition-all ${
                  layoutView === "table"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Table2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Display */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Mail size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600">No messages found</p>
            <p className="text-gray-400 mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            {layoutView === "tiles" && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message.$id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-1"
                    variants={itemVariants}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {message.subject || "No Subject"}
                      </h3>
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {message.name || "N/A"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {message.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(
                            message.submissionDate || message.$createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <span>
                        {new Date(
                          message.submissionDate || message.$createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {layoutView === "list" && (
              <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message.$id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 cursor-pointer border-2 border-transparent hover:border-blue-200"
                    variants={itemVariants}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {message.subject || "No Subject"}
                          </h3>
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium">
                            {message.name || "N/A"}
                          </span>
                          <span className="text-gray-400">•</span>
                          <Mail size={16} className="text-gray-400" />
                          <span>{message.emailAddress || "N/A"}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {message.message}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">
                          {new Date(
                            message.submissionDate || message.$createdAt
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(
                            message.submissionDate || message.$createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {layoutView === "table" && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <motion.table
                    className="min-w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                          Subject
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                          From
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                          Message
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((message, index) => (
                        <motion.tr
                          key={message.$id}
                          className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                          variants={itemVariants}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">
                              {message.subject || "No Subject"}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {message.name || "N/A"}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {message.emailAddress || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {message.message}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600">
                              {new Date(
                                message.submissionDate || message.$createdAt
                              ).toLocaleString()}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Message Modal */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-3xl">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-white pr-8">
                      {selectedMessage.subject || "No Subject"}
                    </h2>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Sender Info */}
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {selectedMessage.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Sender</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedMessage.name, "name")}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {copiedField === "name" ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-3 border-white border-r-2 border-b-2 transform rotate-45 translate-y-[-1px]"></div>
                          </div>
                        ) : (
                          <ClipboardCopy size={18} className="text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <Mail size={20} className="text-white" />
                        </div>
                        <div>
                          <a
                            href={`mailto:${selectedMessage.emailAddress}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {selectedMessage.emailAddress || "N/A"}
                          </a>
                          <div className="text-sm text-gray-500">Email</div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(selectedMessage.emailAddress, "email")
                        }
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {copiedField === "email" ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-3 border-white border-r-2 border-b-2 transform rotate-45 translate-y-[-1px]"></div>
                          </div>
                        ) : (
                          <ClipboardCopy size={18} className="text-gray-600" />
                        )}
                      </button>
                    </div>

                    {selectedMessage.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                            <Phone size={20} className="text-white" />
                          </div>
                          <div>
                            <a
                              href={`tel:${selectedMessage.phoneNumber}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {selectedMessage.phoneNumber}
                            </a>
                            <div className="text-sm text-gray-500">Phone</div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(selectedMessage.phoneNumber, "phone")
                          }
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {copiedField === "phone" ? (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-3 border-white border-r-2 border-b-2 transform rotate-45 translate-y-[-1px]"></div>
                            </div>
                          ) : (
                            <ClipboardCopy
                              size={18}
                              className="text-gray-600"
                            />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(
                            selectedMessage.submissionDate ||
                              selectedMessage.$createdAt
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            selectedMessage.submissionDate ||
                              selectedMessage.$createdAt
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Message
                    </h3>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <a
                      href={`mailto:${selectedMessage.emailAddress}`}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                      <Mail size={18} />
                      <span>Reply via Email</span>
                    </a>
                    {selectedMessage.phoneNumber && (
                      <a
                        href={`tel:${selectedMessage.phoneNumber}`}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-medium"
                      >
                        <Phone size={18} />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
