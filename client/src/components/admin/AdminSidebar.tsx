import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Users, LayoutDashboard, LogOut, Sprout, FileStack, Leaf } from "lucide-react";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content Manager", icon: FileText },
  { href: "/admin/crop-library", label: "Crop Library", icon: Sprout },
  { href: "/admin/documents", label: "Documents", icon: FileStack },
  { href: "/admin/users", label: "User Management", icon: Users },
];

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && location === "/admin") {
      return true;
    }
    return location === href;
  };

  const handleLogout = () => {
    // Perform any logout logic here if needed (clear tokens, etc.)
    // For now, we'll just redirect to the home page
    setLocation("/");
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col z-50 shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Crop Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start h-11 px-4 rounded-lg transition-all duration-200 group ${
                    active 
                      ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg" 
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Logout Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full justify-start h-11 px-4 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 mr-3 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
}