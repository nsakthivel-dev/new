import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Database, FileText, Activity, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminDashboard() {
  const stats = [
    { 
      title: "Total Users", 
      value: "1,248", 
      icon: Users, 
      change: "+12%", 
      trend: "up",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Content Items", 
      value: "342", 
      icon: FileText, 
      change: "+5%", 
      trend: "up",
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Data Storage", 
      value: "2.4 GB", 
      icon: Database, 
      change: "+3%", 
      trend: "up",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Active Sessions", 
      value: "142", 
      icon: Activity, 
      change: "+8%", 
      trend: "up",
      color: "from-orange-500 to-orange-600"
    },
  ];

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity and Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest actions in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New content added", time: "2 minutes ago", user: "Admin", type: "success" },
                { action: "User registered", time: "1 hour ago", user: "Farmer123", type: "info" },
                { action: "Data backup completed", time: "3 hours ago", user: "System", type: "success" },
                { action: "Content updated", time: "5 hours ago", user: "Editor", type: "info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <div className={`mt-1.5 w-2 h-2 rounded-full ${
                    activity.type === "success" ? "bg-green-500" : "bg-blue-500"
                  } animate-pulse`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="font-medium">{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>System Status</CardTitle>
            </div>
            <CardDescription>Monitor your services health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { service: "Database", status: "Operational", uptime: "99.9%", icon: Database },
                { service: "API Server", status: "Operational", uptime: "99.8%", icon: Activity },
                { service: "File Storage", status: "Degraded", uptime: "95.2%", icon: FileText },
                { service: "Authentication", status: "Operational", uptime: "100%", icon: Users },
              ].map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        service.status === "Operational" ? "bg-green-100" : "bg-yellow-100"
                      }`}>
                        <ServiceIcon className={`h-4 w-4 ${
                          service.status === "Operational" ? "text-green-600" : "text-yellow-600"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{service.service}</p>
                        <p className="text-xs text-muted-foreground">{service.uptime} uptime</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      service.status === "Operational" 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}>
                      {service.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </main>
      <AdminFooter />
    </>
  );
}