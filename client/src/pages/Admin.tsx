import { useEffect } from "react";
import { useLocation } from "wouter";
import CropLibraryManager from "@/components/admin/CropLibraryManager";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";

export default function Admin() {
  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <CropLibraryManager />
        </div>
      </main>
      <AdminFooter />
    </>
  );
}