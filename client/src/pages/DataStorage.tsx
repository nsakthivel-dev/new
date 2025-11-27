import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";

// Types for our content
interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: any; // Firebase timestamp
}

export default function DataStorage() {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [extractedContent, setExtractedContent] = useState<{ filename: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setExtractedContent(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      setExtractedContent({
        filename: result.filename,
        content: result.content,
      });

      toast({
        title: "Success",
        description: `File "${result.filename}" uploaded and processed successfully!`,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Error uploading file: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Data Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button onClick={triggerFileInput} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: PDF, DOCX, TXT
            </p>
          </div>

          {extractedContent && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Extracted Content</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">File: {extractedContent.filename}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This content was extracted from your uploaded file. To save it, use the Admin panel.
                </p>
                <div className="bg-muted p-4 rounded mt-2 max-h-60 overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {extractedContent.content}
                  </pre>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm">
                    <strong>Note:</strong> This page is for viewing extracted content only. 
                    To edit and save content, please go to the <a href="/admin" className="text-blue-600 hover:underline">Admin Panel</a>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <h3 className="text-lg font-semibold mb-4">Stored Content</h3>
          {loading ? (
            <p>Loading content...</p>
          ) : contentList.length === 0 ? (
            <p>No content available yet.</p>
          ) : (
            <div className="space-y-4">
              {contentList.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created: {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <pre className="mt-2 bg-muted p-4 rounded max-h-40 overflow-auto whitespace-pre-wrap">
                      {item.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}