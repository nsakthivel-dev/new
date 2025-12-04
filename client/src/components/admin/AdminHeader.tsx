import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

export default function AdminHeader() {
  const [location] = useLocation();
  
  // Map routes to page titles
  const getPageTitle = () => {
    switch (location) {
      case "/admin":
      case "/admin/crop-library":
        return "Crop Library Manager";
      case "/admin/dashboard":
        return "Admin Dashboard";
      case "/admin/content":
        return "Content Manager";
      case "/admin/documents":
        return "Document Manager";
      case "/admin/users":
        return "User Management";
      default:
        return "Admin Panel";
    }
  };
  
  const getPageDescription = () => {
    switch (location) {
      case "/admin":
      case "/admin/crop-library":
        return "Manage crop library content that will be displayed on the public crop library page";
      case "/admin/dashboard":
        return "Overview of your application statistics and recent activity";
      case "/admin/content":
        return "Manage general content for your application";
      case "/admin/documents":
        return "Upload and manage documents for the knowledge base";
      case "/admin/users":
        return "Manage user accounts and permissions";
      default:
        return "Manage your application settings and content";
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
          <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}