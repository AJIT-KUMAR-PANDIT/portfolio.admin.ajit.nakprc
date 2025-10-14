"use client";

import React, { useEffect, useState } from "react";
import { Client, Databases, Query } from "appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_ID,
} from "@/utils/env";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ClipboardCopy,
  Calendar,
  Clock,
  Filter,
  Download,
} from "lucide-react";

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
  const [layoutView, setLayoutView] = useState("tiles"); // 'tiles', 'list', 'table'
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

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
    searchQuery,
  ]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let queries = [Query.orderDesc("$createdAt")];

      // Apply search query if present
      if (searchQuery) {
        queries.push(Query.search("subject", searchQuery));
        queries.push(Query.search("message", searchQuery));
        queries.push(Query.search("name", searchQuery));
        queries.push(Query.search("emailAddress", searchQuery));
      }

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
            filterEndDate.setDate(filterEndDate.getDate() + 1); // Include the end date fully
          }
          break;
        case "custom_time":
          // Time filtering will be applied after fetching all messages for the day
          break;
        case "custom_days":
          if (startDay && endDay) {
            // Assuming startDay and endDay are numbers representing days of the month
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
          // No date filter
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

      // Apply time filter if custom_time is selected
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

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const handleExportCSV = () => {
    if (messages.length === 0) {
      alert("No messages to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email Address",
      "Phone Number",
      "Message",
      "Submission Date",
    ];
    const csvRows = [];
    csvRows.push(headers.join(","));

    messages.forEach((message) => {
      const submissionDate = new Date(
        message.submissionDate || message.$createdAt
      ).toLocaleString();
      const row = [
        `"${message.$id}"`,
        `"${message.name ? message.name.replace(/"/g, '""') : ""}"`,
        `"${
          message.emailAddress ? message.emailAddress.replace(/"/g, '""') : ""
        }"`,
        `"${
          message.phoneNumber ? message.phoneNumber.replace(/"/g, '""') : ""
        }"`,
        `"${message.message ? message.message.replace(/"/g, '""') : ""}"`,
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter and Export Section */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all_ranges">All Ranges</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="past_year">Past Year</option>
            <option value="custom_date">Range of Dates</option>
            <option value="custom_time">Range of Time</option>
            <option value="custom_days">Range of Days</option>
            <option value="custom_years">Range of Years</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {filter === "custom_date" && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}

        {filter === "custom_time" && (
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
            <span>to</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}

        {filter === "custom_days" && (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Start Day"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="End Day"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}

        {filter === "custom_years" && (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Start Year"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="End Year"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="bg-white border border-gray-300 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}

        <button
          onClick={handleExportCSV}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <Download size={18} className="mr-2" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Layout View Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => setLayoutView("tiles")}
          className={`px-4 py-2 rounded ${
            layoutView === "tiles"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Tiles View
        </button>
        <button
          onClick={() => setLayoutView("list")}
          className={`px-4 py-2 rounded ${
            layoutView === "list"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setLayoutView("table")}
          className={`px-4 py-2 rounded ${
            layoutView === "table"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Table View
        </button>
      </div>

      {messages.length === 0 ? (
        <p>No messages in your inbox.</p>
      ) : (
        <>
          {layoutView === "tiles" && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.$id}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  variants={itemVariants}
                  onClick={() => handleMessageClick(message)}
                >
                  <h2 className="text-xl font-semibold text-blue-600">
                    {message.subject || "No Subject"}
                  </h2>
                  <p className="text-gray-600 text-sm font-medium">
                    From:{" "}
                    <span className="text-gray-800">
                      {message.name || "N/A"}
                    </span>{" "}
                    &lt;
                    <span className="text-gray-800">
                      {message.emailAddress || "N/A"}
                    </span>
                    &gt;
                  </p>
                  <p className="text-gray-800 mt-2 line-clamp-1">
                    {message.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-2 font-medium">
                    Received:{" "}
                    <span className="text-gray-700">
                      {new Date(
                        message.submissionDate || message.$createdAt
                      ).toLocaleString()}
                    </span>
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {layoutView === "list" && (
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.$id}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex items-center justify-between"
                  variants={itemVariants}
                  onClick={() => handleMessageClick(message)}
                >
                  <div>
                    <h2 className="text-lg font-semibold text-blue-600">
                      {message.subject || "No Subject"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      From: {message.name || "N/A"} &lt;
                      {message.emailAddress || "N/A"}&gt;
                    </p>
                    <p className="text-gray-800 text-sm mt-1 line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs ml-4 flex-shrink-0">
                    {new Date(
                      message.submissionDate || message.$createdAt
                    ).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {layoutView === "table" && (
            <div className="overflow-x-auto">
              <motion.table
                className="min-w-full bg-white shadow-md rounded-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Subject</th>
                    <th className="py-3 px-6 text-left">From</th>
                    <th className="py-3 px-6 text-left">Message</th>
                    <th className="py-3 px-6 text-left">Received</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {messages.map((message) => (
                    <motion.tr
                      key={message.$id}
                      className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                      variants={itemVariants}
                      onClick={() => handleMessageClick(message)}
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="font-medium text-blue-600">
                          {message.subject || "No Subject"}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div className="flex items-center">
                          <span>
                            {message.name || "N/A"} &lt;
                            {message.emailAddress || "N/A"}&gt;
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className="line-clamp-1">{message.message}</span>
                      </td>
                      <td className="py-3 px-6 text-left">
                        {new Date(
                          message.submissionDate || message.$createdAt
                        ).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-blue-700">
                {selectedMessage.subject || "No Subject"}
              </h2>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 flex items-center">
                  <span className="font-semibold">Name:</span>{" "}
                  {selectedMessage.name || "N/A"}
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(selectedMessage.name)
                    }
                    className="text-gray-500 hover:text-gray-900 focus:outline-none ml-2"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                </p>
                <p className="text-gray-700 flex items-center">
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href={`mailto:${selectedMessage.emailAddress}`}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    {selectedMessage.emailAddress || "N/A"}
                  </a>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        selectedMessage.emailAddress
                      )
                    }
                    className="text-gray-500 hover:text-gray-900 focus:outline-none"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                </p>
                {selectedMessage.phoneNumber && (
                  <p className="text-gray-700 flex items-center">
                    <span className="font-semibold">Phone:</span>{" "}
                    <a
                      href={`tel:${selectedMessage.phoneNumber}`}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      {selectedMessage.phoneNumber}
                    </a>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          selectedMessage.phoneNumber
                        )
                      }
                      className="text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                      <ClipboardCopy size={16} />
                    </button>
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-semibold">Received:</span>{" "}
                  {new Date(
                    selectedMessage.submissionDate || selectedMessage.$createdAt
                  ).toLocaleString()}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
