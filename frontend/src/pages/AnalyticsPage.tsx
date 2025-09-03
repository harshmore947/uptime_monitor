import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useMonitorStore } from "@/stores/monitor-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useNavigate } from "react-router-dom";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { monitors, fetchMonitors } = useMonitorStore();
  const { fetchDashboard } = useDashboardStore();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMonitor, setSelectedMonitor] = useState("all");

  useEffect(() => {
    fetchMonitors();
    fetchDashboard();
  }, [fetchMonitors, fetchDashboard]);

  const handleRefresh = () => {
    fetchMonitors();
    fetchDashboard();
  };

  // Calculate analytics data
  const totalMonitors = monitors.length;
  const activeMonitors = monitors.filter((m) => m.status === "up").length;
  const downMonitors = monitors.filter((m) => m.status === "down").length;
  const uptimePercentage =
    totalMonitors > 0 ? ((activeMonitors / totalMonitors) * 100).toFixed(1) : 0;

  // Mock data for charts (in a real app, this would come from the backend)
  const uptimeData = [
    { date: "2025-08-24", uptime: 99.8 },
    { date: "2025-08-25", uptime: 99.9 },
    { date: "2025-08-26", uptime: 99.7 },
    { date: "2025-08-27", uptime: 99.9 },
    { date: "2025-08-28", uptime: 99.6 },
    { date: "2025-08-29", uptime: 99.8 },
    { date: "2025-08-30", uptime: 99.9 },
  ];

  const responseTimeData = [
    { monitor: "Main Website", avgTime: 245 },
    { monitor: "API Server", avgTime: 180 },
    { monitor: "Database", avgTime: 320 },
    { monitor: "CDN", avgTime: 95 },
  ];

  const statusDistribution = [
    { status: "Up", count: activeMonitors, color: "bg-green-500" },
    { status: "Down", count: downMonitors, color: "bg-red-500" },
    {
      status: "Pending",
      count: monitors.filter((m) => m.status === "pending").length,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-slate-100">
              UptimeMonitor
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Monitor performance metrics and uptime statistics
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <Select value={selectedMonitor} onValueChange={setSelectedMonitor}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Monitors</SelectItem>
                {monitors.map((monitor) => (
                  <SelectItem key={monitor._id} value={monitor._id}>
                    {monitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Monitors
              </CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {totalMonitors}
              </div>
              <p className="text-xs text-slate-400">
                Active monitoring services
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Uptime
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {uptimePercentage}%
              </div>
              <p className="text-xs text-slate-400">Overall availability</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Active Monitors
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {activeMonitors}
              </div>
              <p className="text-xs text-slate-400">Currently online</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Incidents
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {downMonitors}
              </div>
              <p className="text-xs text-slate-400">Services with issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Uptime Trend Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Uptime Trend
              </CardTitle>
              <CardDescription className="text-slate-400">
                Daily uptime percentage over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {uptimeData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t"
                      style={{ height: `${(data.uptime / 100) * 200}px` }}
                    />
                    <span className="text-xs text-slate-400">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Time Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Average Response Time
              </CardTitle>
              <CardDescription className="text-slate-400">
                Response time by monitor (milliseconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responseTimeData.map((data, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-300">
                      {data.monitor}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                          style={{ width: `${(data.avgTime / 400) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-12">
                        {data.avgTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-400" />
              Monitor Status Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current status breakdown of all monitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {item.count}
                  </div>
                  <span className="text-sm text-slate-300">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monitor Performance Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">
              Monitor Performance
            </CardTitle>
            <CardDescription className="text-slate-400">
              Detailed performance metrics for each monitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Monitor
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Uptime
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Avg Response
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Last Check
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((monitor) => (
                    <tr
                      key={monitor._id}
                      className="border-b border-slate-700/50"
                    >
                      <td className="py-3 px-4 text-slate-100">
                        {monitor.name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            monitor.status === "up" ? "default" : "destructive"
                          }
                          className={
                            monitor.status === "up"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }
                        >
                          {monitor.status === "up" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {monitor.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-300">99.8%</td>
                      <td className="py-3 px-4 text-slate-300">245ms</td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date().toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
