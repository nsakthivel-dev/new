import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";

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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Stored Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold">Content Items</h3>
              <Button variant="outline" size="sm" onClick={fetchContent} disabled={loading}>
                Refresh
              </Button>
            </div>
            
            {contentList.length === 0 ? (
              <p className="text-muted-foreground">No content stored yet.</p>
            ) : (
              <div className="space-y-4">
                {contentList.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created: {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <pre className="mt-2 bg-muted p-4 rounded max-h-40 overflow-auto whitespace-pre-wrap text-sm">
                            {item.content}
                          </pre>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                          className="whitespace-nowrap"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}