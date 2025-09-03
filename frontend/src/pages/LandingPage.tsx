import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Monitor, Shield, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import HeartbeatAnimation from "@/components/ui/heartbeat-animation";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              UptimeMonitor
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Heartbeat Animation */}
        <HeartbeatAnimation
          className="opacity-60"
          strokeColor="#06b6d1"
          duration={4}
        />

        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge
            variant="secondary"
            className="mb-6 bg-card/50 text-primary border-primary/20 backdrop-blur-sm"
          >
            Professional Uptime Monitoring
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold mb-8 max-w-5xl mx-auto leading-tight">
            Keep Your Services
            <span className="block bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
              Online & Alive
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Monitor your websites, APIs, and services 24/7 with real-time
            alerts, detailed analytics, and enterprise-grade reliability. Never
            miss a downtime again.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
              >
                Start Monitoring Free
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
            >
              View Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Global Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Instant Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Everything You Need to Stay Online
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powerful features designed for developers and businesses who demand
            reliable monitoring and instant insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground mb-2">
                Real-Time Monitoring
              </CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Check your services every 30 seconds with instant notifications
                and detailed response metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground mb-2">
                Real-Time Monitoring
              </CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Check your services every 30 seconds with instant notifications
                and detailed response metrics.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
                <Monitor className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground mb-2">
                Advanced Analytics
              </CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Track uptime, response times, and performance metrics with
                beautiful dashboards and reports.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">
                Free
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4">
                Perfect for getting started
              </CardDescription>
              <div className="text-4xl font-bold text-foreground mb-2">$0</div>
              <div className="text-muted-foreground">forever</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>5 monitors</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>5-minute checks</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Email alerts</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Basic analytics</span>
                </div>
              </div>
              <Link to="/signup" className="block mt-8">
                <Button className="mt-9 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">
                Pro
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4">
                For growing businesses
              </CardDescription>
              <div className="text-4xl font-bold text-foreground mb-2">$19</div>
              <div className="text-muted-foreground">per month</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>50 monitors</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>30-second checks</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>All alert types</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>API access</span>
                </div>
              </div>
              <Link to="/signup" className="block mt-8">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Pro Trial
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">
                Enterprise
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4">
                For large organizations
              </CardDescription>
              <div className="text-4xl font-bold text-foreground mb-2">
                Custom
              </div>
              <div className="text-muted-foreground">pricing</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Unlimited monitors</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>SLA guarantees</span>
                </div>
                <div className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>White-label option</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                UptimeMonitor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-slate-500">
              <a
                href="#"
                className="hover:text-primary transition-colors duration-200"
              >
                API Docs
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center text-slate-600">
            <p>© 2025 UptimeMonitor. Built with ❤️ by Harsh.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
