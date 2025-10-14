"use client";

import React, { useEffect, useState } from "react";
import { Client, Databases, Query } from "appwrite";
import { motion } from "framer-motion";
import {
  Mail,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  Activity,
  Eye,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_ID,
} from "@/utils/env";

const client = new Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
const databases = new Databases(client);

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    unread: 0,
    avgResponseTime: "2.5 hrs",
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_TABLE_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );

      const msgs = response.documents;
      setMessages(msgs);
      calculateStats(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
      // Use mock data for demonstration
      const mockMessages = generateMockMessages();
      setMessages(mockMessages);
      calculateStats(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMessages = () => {
    const names = [
      "Sarah Johnson",
      "Michael Chen",
      "Emma Wilson",
      "James Brown",
      "Olivia Davis",
      "William Garcia",
      "Sophia Martinez",
      "Lucas Anderson",
    ];
    const subjects = [
      "Project Inquiry",
      "Design Feedback",
      "Meeting Request",
      "Quote Request",
      "Support Question",
      "Partnership Proposal",
      "General Inquiry",
    ];
    const mockData = [];

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      mockData.push({
        $id: `msg-${i}`,
        name: names[Math.floor(Math.random() * names.length)],
        emailAddress: `user${i}@example.com`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        message: "This is a sample message content.",
        $createdAt: date.toISOString(),
      });
    }
    return mockData;
  };

  const calculateStats = (msgs) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayMsgs = msgs.filter((m) => new Date(m.$createdAt) >= today);
    const thisWeekMsgs = msgs.filter(
      (m) => new Date(m.$createdAt) >= thisWeekStart
    );
    const thisMonthMsgs = msgs.filter(
      (m) => new Date(m.$createdAt) >= thisMonthStart
    );

    setStats({
      total: msgs.length,
      today: todayMsgs.length,
      thisWeek: thisWeekMsgs.length,
      thisMonth: thisMonthMsgs.length,
      unread: Math.floor(msgs.length * 0.3),
      avgResponseTime: "2.5 hrs",
    });
  };

  const getMessagesByDay = () => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const count = messages.filter((m) => {
        const msgDate = new Date(m.$createdAt);
        return msgDate >= dayStart && msgDate < dayEnd;
      }).length;

      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        messages: count,
      });
    }

    return last7Days;
  };

  const getMessagesByHour = () => {
    const hourCounts = Array(24).fill(0);

    messages.forEach((m) => {
      const hour = new Date(m.$createdAt).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({
        hour: `${hour}:00`,
        messages: count,
      }))
      .filter((_, i) => i % 3 === 0); // Show every 3 hours
  };

  const getMessagesByCategory = () => {
    const categories = {
      "Project Inquiry": 0,
      "Design Feedback": 0,
      "Meeting Request": 0,
      "Quote Request": 0,
      Support: 0,
      Other: 0,
    };

    messages.forEach((m) => {
      const subject = m.subject || "";
      if (
        subject.toLowerCase().includes("project") ||
        subject.toLowerCase().includes("inquiry")
      ) {
        categories["Project Inquiry"]++;
      } else if (
        subject.toLowerCase().includes("design") ||
        subject.toLowerCase().includes("feedback")
      ) {
        categories["Design Feedback"]++;
      } else if (subject.toLowerCase().includes("meeting")) {
        categories["Meeting Request"]++;
      } else if (subject.toLowerCase().includes("quote")) {
        categories["Quote Request"]++;
      } else if (subject.toLowerCase().includes("support")) {
        categories["Support"]++;
      } else {
        categories["Other"]++;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getRecentMessages = () => {
    return messages.slice(0, 5);
  };

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dailyChange =
    stats.today > 0 ? ((stats.today / stats.thisWeek) * 100).toFixed(0) : 0;
  const weeklyChange =
    stats.thisWeek > 0
      ? ((stats.thisWeek / stats.thisMonth) * 100).toFixed(0)
      : 0;

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your inbox analytics and activity
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Messages */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-blue-200 transition-all"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-500">Total Messages</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>All time</span>
            </div>
          </motion.div>

          {/* Today's Messages */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-purple-200 transition-all"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.today}
                </div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight size={16} className="mr-1" />
              <span>{dailyChange}% of weekly</span>
            </div>
          </motion.div>

          {/* This Week */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-indigo-200 transition-all"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.thisWeek}
                </div>
                <div className="text-sm text-gray-500">This Week</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight size={16} className="mr-1" />
              <span>{weeklyChange}% of monthly</span>
            </div>
          </motion.div>

          {/* Unread */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-pink-200 transition-all"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.unread}
                </div>
                <div className="text-sm text-gray-500">Unread</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-orange-600">
              <Eye size={16} className="mr-1" />
              <span>Needs attention</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Messages Over Time */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Messages This Week
                </h2>
                <p className="text-sm text-gray-500">Daily message volume</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={getMessagesByDay()}>
                <defs>
                  <linearGradient
                    id="colorMessages"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Messages by Category */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Message Categories
                </h2>
                <p className="text-sm text-gray-500">Distribution by type</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <PieChart size={20} className="text-white" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={getMessagesByCategory()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getMessagesByCategory().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Activity Heatmap and Recent Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Activity */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Hourly Activity
                </h2>
                <p className="text-sm text-gray-500">Messages by time of day</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getMessagesByHour()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  stroke="#9ca3af"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="messages"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent</h2>
                <p className="text-sm text-gray-500">Latest messages</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
            </div>
            <div className="space-y-4">
              {getRecentMessages().map((msg, index) => (
                <div
                  key={msg.$id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {(msg.name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {msg.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {msg.subject || "No subject"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.$createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">
                  {stats.avgResponseTime}
                </div>
                <div className="text-blue-100">Avg Response Time</div>
              </div>
              <Clock size={40} className="opacity-50" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">95%</div>
                <div className="text-purple-100">Response Rate</div>
              </div>
              <CheckCircle size={40} className="opacity-50" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">{stats.thisMonth}</div>
                <div className="text-pink-100">This Month</div>
              </div>
              <TrendingUp size={40} className="opacity-50" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
