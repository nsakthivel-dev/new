import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Users, LayoutDashboard, LogOut, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/content", label: "Content Manager", icon: <FileText className="h-5 w-5" /> },
  { href: "/admin/crop-library", label: "Crop Library", icon: <Sprout className="h-5 w-5" /> },
  { href: "/admin/documents", label: "Document Manager", icon: <FileText className="h-5 w-5" /> },
  { href: "/admin/users", label: "User Management", icon: <Users className="h-5 w-5" /> },
];

export default function AdminSidebar() {
  const [location] = useLocation();

  // Check if we're on the base /admin route
  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && location === "/admin") {
      return true;
    }
    return location === href;
  };

  return (
    <div className="fixed top-0 left-0 w-64 bg-gradient-to-b from-card to-muted border-r border-border min-h-screen p-4 flex flex-col z-50">
      <div className="mb-8 mt-4">
        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Crop Disease & Pest Management</p>
        </Card>
      </div>
      
      <nav className="flex-1">
        <div className="space-y-2">
          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="block">
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start h-12 px-4 rounded-lg transition-all duration-200 ${
                    active 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className={`${active ? "text-primary-foreground" : "text-muted-foreground"} mr-3`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full justify-start h-12 px-4 rounded-lg border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}