import { Leaf } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="border-t bg-card py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Crop Disease & Pest Scout</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Crop Disease & Pest Scout. All rights reserved.
          </div>
          <div className="text-sm text-muted-foreground">
            Admin Panel v1.0
          </div>
        </div>
      </div>
    </footer>
  );
}