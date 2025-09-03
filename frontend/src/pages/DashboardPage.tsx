import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  LogOut,
  User,
  Settings,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMonitorStore } from "@/stores/monitor-store";
import { useIncidentStore } from "@/stores/incident-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useStatusPageStore } from "@/stores/status-page-store";
import { useNavigate } from "react-router-dom";
import { CreateMonitorDialog } from "@/components/CreateMonitorDialog";
import { CreateIncidentDialog } from "@/components/CreateIncidentDialog";
import { CreateStatusPageDialog } from "@/components/CreateStatusPageDialog";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const {
    monitors,
    isLoading: monitorsLoading,
    fetchMonitors,
  } = useMonitorStore();
  const {
    incidents,
    isLoading: incidentsLoading,
    fetchIncidents,
  } = useIncidentStore();
  const {
    stats,
    isLoading: dashboardLoading,
    fetchDashboard,
  } = useDashboardStore();
  const {
    statusPages,
    isLoading: statusPagesLoading,
    fetchStatusPages,
  } = useStatusPageStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Fetch initial data
    fetchDashboard();
    fetchMonitors();
    fetchIncidents();
    fetchStatusPages();
  }, [fetchDashboard, fetchMonitors, fetchIncidents, fetchStatusPages]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleRefresh = () => {
    fetchDashboard();
    fetchMonitors();
    fetchIncidents();
    fetchStatusPages();
  };

  const isLoading =
    monitorsLoading ||
    incidentsLoading ||
    dashboardLoading ||
    statusPagesLoading;

  const recentIncidents = incidents.slice(0, 3); // Show only recent 3 incidents

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              UptimeMonitor
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:bg-accent"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:bg-accent"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name || user?.email}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-background/30">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("monitors")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "monitors"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Monitors
            </button>
            <button
              onClick={() => setActiveTab("incidents")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "incidents"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => setActiveTab("statuspages")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "statuspages"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Status Pages
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4">
        {/* Heartbeat Animation
        <HeartbeatAnimation
          className="opacity-30"
          strokeColor="#06b6d1"
          duration={6}
        /> */}

        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.name || "User"}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your services today.
              </p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Monitors
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.totalMonitors || 0}
                      </p>
                    </div>
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Uptime
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {stats?.uptimePercentage
                          ? stats.uptimePercentage.toFixed(1)
                          : "0.0"}
                        %
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Incidents
                      </p>
                      <p className="text-2xl font-bold text-destructive">
                        {stats?.totalIncidents || 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg Response
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.averageResponseTime
                          ? stats.averageResponseTime.toFixed(0)
                          : "0"}
                        ms
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Content based on active tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card className="bg-card border-border backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Latest updates from your monitors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentIncidents.length > 0 ? (
                      recentIncidents.map((incident) => (
                        <div
                          key={incident._id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                incident.status === "resolved"
                                  ? "bg-green-400"
                                  : "bg-destructive"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {incident.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(incident.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              incident.status === "resolved"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {incident.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No recent incidents
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-card border-border backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CreateMonitorDialog>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Add New Monitor
                      </Button>
                    </CreateMonitorDialog>

                    <CreateIncidentDialog>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Incident
                      </Button>
                    </CreateIncidentDialog>

                    <CreateStatusPageDialog>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Create Status Page
                      </Button>
                    </CreateStatusPageDialog>

                    <Button className="w-full justify-start" variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Configure Alerts
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/analytics")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === "monitors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Monitor Status
                  </h2>
                  <CreateMonitorDialog />
                </div>

                <div className="grid gap-4">
                  {monitors.length > 0 ? (
                    monitors.map((monitor) => (
                      <Card
                        key={monitor._id}
                        className="bg-card border-border backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  monitor.isActive
                                    ? "bg-green-400"
                                    : "bg-destructive"
                                }`}
                              />
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {monitor.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {monitor.url} • {monitor.type.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {monitor.isActive ? "Active" : "Inactive"}
                              </p>
                              <Badge
                                variant={
                                  monitor.isActive ? "secondary" : "destructive"
                                }
                              >
                                {monitor.isActive ? "Running" : "Stopped"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No monitors configured
                    </p>
                  )}
                </div>
              </div>
            )}
            {activeTab === "incidents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Active Incidents
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">
                      {stats?.totalIncidents || 0} Total
                    </Badge>
                    <CreateIncidentDialog />
                  </div>
                </div>

                <div className="space-y-4">
                  {incidents.length > 0 ? (
                    incidents.slice(0, 5).map((incident) => (
                      <Card
                        key={incident._id}
                        className="bg-card border-border backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <AlertTriangle
                                className={`h-5 w-5 ${
                                  incident.status === "resolved"
                                    ? "text-green-400"
                                    : "text-destructive"
                                }`}
                              />
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {incident.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {incident.description} •{" "}
                                  {new Date(
                                    incident.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                incident.status === "resolved"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {incident.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No incidents reported
                    </p>
                  )}
                </div>
              </div>
            )}{" "}
            {activeTab === "statuspages" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Status Pages
                  </h2>
                  <CreateStatusPageDialog />
                </div>

                <div className="grid gap-4">
                  {statusPages.length > 0 ? (
                    statusPages.map((statusPage) => (
                      <Card
                        key={statusPage._id}
                        className="bg-card border-border backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  statusPage.isPublic
                                    ? "bg-green-400"
                                    : "bg-yellow-400"
                                }`}
                              />
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {statusPage.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {statusPage.description || "No description"}
                                </p>
                                {statusPage.isPublic && (
                                  <p className="text-xs text-green-400 mt-1">
                                    Public • {statusPage.monitors.length}{" "}
                                    monitors
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  statusPage.isPublic ? "secondary" : "outline"
                                }
                              >
                                {statusPage.isPublic ? "Public" : "Private"}
                              </Badge>
                              {statusPage.isPublic && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `/status/${statusPage.slug}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  View Page
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No status pages created yet
                      </p>
                      <CreateStatusPageDialog>
                        <Button>Create Your First Status Page</Button>
                      </CreateStatusPageDialog>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
