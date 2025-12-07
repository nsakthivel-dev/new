import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: any; // Firebase timestamp
}

export default function ContentManager() {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch content from Firebase
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getContent();
      setContentList(data);
    } catch (error: any) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from Firebase
      await firebaseService.deleteContent(id);
      
      const updatedContentList = contentList.filter(item => item.id !== id);
      setContentList(updatedContentList);
      
      toast({
        title: "Success",
        description: "Content deleted successfully!",
      });
    } catch (error: any) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      <Card className="shadow-md">
        <CardHeader className="border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Stored Content</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchContent} 
              disabled={loading}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && contentList.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading content...</p>
            </div>
          ) : contentList.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">No content stored yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start by adding your first content item</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentList.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg text-foreground">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created: {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <pre className="bg-muted/50 p-4 rounded-lg max-h-40 overflow-auto whitespace-pre-wrap text-sm font-mono border border-border">
                          {item.content}
                        </pre>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="whitespace-nowrap gap-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>
      <AdminFooter />
    </>
  );
}