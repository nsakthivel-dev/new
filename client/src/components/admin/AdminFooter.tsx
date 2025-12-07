import { Leaf, Shield } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-4 mt-auto">
      <div className="px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Crop Disease & Pest Scout</span>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Admin Panel v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}