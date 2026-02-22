import { useState } from "react";
import {
  Search,
  MapPin,
  ClipboardList,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Eye,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

/* ───────────────────────── Static Data ───────────────────────── */

const statsData = [
  {
    label: "Total Issues",
    count: 4,
    icon: ClipboardList,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    label: "Pending",
    count: 4,
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    label: "In Progress",
    count: 4,
    icon: MessageCircle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    label: "Resolved",
    count: 4,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
];

const recentActivity = [
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "Pending",
  },
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "In Progress",
  },
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "Resolved",
  },
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "Pending",
  },
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "Pending",
  },
  {
    title: "pothole on 5th Ave",
    time: "Reported 2h ago",
    location: "Downtown Crossing",
    priority: 42,
    status: "In Progress",
  },
];

/* Bar heights for the weekly chart (7 days, tallest = full height) */
const weeklyBars = [60, 80, 50, 95, 70, 85, 45];

/* ───────────────────────── Helper Components ───────────────────────── */

/** Status badge with colour coding */
const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "border-orange-400 text-orange-500",
    "In Progress": "border-indigo-400 text-indigo-600",
    Resolved: "border-green-400 text-green-600",
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${styles[status] ?? ""}`}
    >
      {status}
    </span>
  );
};

/* ───────────────────────── Main Dashboard ───────────────────────── */

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {/* ──── Stat Cards ──── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${stat.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ──── Search & View Map ──── */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Your report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* View Map */}
          <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
            <MapPin className="h-4 w-4" />
            View Map
          </button>
        </div>

        {/* ──── Main Content Grid ──── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ─── Left: Recent Activity Table ─── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-800">
                Recent Activity
              </h2>
              <button className="text-sm font-medium text-gray-500 hover:text-indigo-600">
                View All Report
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">Issue Details</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3 text-center">Priority</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">
                        {item.priority}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 p-4 md:hidden">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-500">
                        <span className="font-medium text-gray-700">
                          {item.location}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Priority:{" "}
                        <span className="font-semibold text-gray-600">
                          {item.priority}
                        </span>
                      </p>
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Sidebar Widgets ─── */}
          <div className="flex flex-col gap-6">
            {/* ── Weekly Reports ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  Weekly Reports
                </h3>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                  +12%
                </span>
              </div>

              {/* Bar Chart */}
              <div className="mt-4 flex items-end justify-between gap-2 h-28">
                {weeklyBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-indigo-600 transition-all hover:bg-indigo-700"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-2xl font-bold text-gray-800">342</p>
                <p className="text-xs text-gray-400">
                  Reports submitted this week
                </p>
              </div>
            </div>

            {/* ── Community Likes ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  Community Likes
                </h3>
                <button className="text-xs font-semibold text-orange-500 hover:underline">
                  View All Likes
                </button>
              </div>

              <p className="mt-2 text-xl font-bold text-gray-800">1.2K</p>
              <p className="text-xs text-gray-400">Engagement Total</p>

              {/* Like Bars */}
              <div className="mt-4 flex flex-col gap-3">
                {/* PotHole */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">PotHole</span>
                    <span className="font-semibold text-gray-700">
                      640 likes
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full bg-indigo-600"
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
                {/* Street Lighting */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      Street Lighting
                    </span>
                    <span className="font-semibold text-gray-700">
                      320 likes
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full bg-yellow-400"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Comment Sentiment ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  Comment Sentiment
                </h3>
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-600">
                  HEALTHY
                </span>
              </div>

              {/* Positive % */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Positive
                </span>
                <span className="text-sm font-bold text-gray-800">72%</span>
              </div>

              {/* Segmented Bar */}
              <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
                <div className="bg-green-500" style={{ width: "72%" }} />
                <div className="bg-yellow-400" style={{ width: "18%" }} />
                <div className="bg-red-400" style={{ width: "10%" }} />
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  Positive
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  Neutral
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  Negative
                </span>
              </div>

              {/* Bottom Stats */}
              <div className="mt-4 grid grid-cols-3 border-t border-gray-100 pt-3 text-center text-xs">
                <div>
                  <p className="font-bold uppercase text-gray-400">Neutral</p>
                  <p className="mt-0.5 text-base font-bold text-gray-800">
                    18%
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase text-gray-400">Negative</p>
                  <p className="mt-0.5 text-base font-bold text-gray-800">
                    10%
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase text-gray-400">Trend</p>
                  <p className="mt-0.5 flex items-center justify-center text-base font-bold text-gray-800">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
