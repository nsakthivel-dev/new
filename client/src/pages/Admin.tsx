import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";

// Types for our content
interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: any; // Firebase timestamp
}

export default function Admin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Save to Firebase
      const newContent = await firebaseService.addContent({ title, content });
      
      setContentList([...contentList, newContent]);
      setTitle("");
      setContent("");
      
      toast({
        title: "Success",
        description: "Content saved successfully!",
      });
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content: " + error.message,
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
      
      // Set extracted content to display in editor (not auto-saving)
      setExtractedContent({
        filename: result.filename,
        content: result.content,
      });
      
      // Populate the form fields with extracted content
      setTitle(result.filename);
      setContent(result.content);

      toast({
        title: "Success",
        description: `File "${result.filename}" uploaded and processed successfully! You can now edit the content before saving.`,
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

  // Function to save the extracted content after editing
  const saveExtractedContent = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Save to Firebase
      const newContent = await firebaseService.addContent({ title, content });
      
      setContentList([...contentList, newContent]);
      setExtractedContent(null); // Clear the extracted content section
      
      toast({
        title: "Success",
        description: "Extracted content saved successfully!",
      });
    } catch (error: any) {
      console.error("Error saving extracted content:", error);
      toast({
        title: "Error",
        description: "Failed to save extracted content: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - Data Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter content title"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={6}
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Content"}
              </Button>
              
              {extractedContent && (
                <Button 
                  type="button" 
                  onClick={saveExtractedContent}
                  disabled={loading}
                  variant="secondary"
                >
                  {loading ? "Saving Extracted..." : "Save Extracted Content"}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
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
          
          {/* Display extracted content */}
          {extractedContent && (
            <Card className="mt-6 border-primary">
              <CardHeader>
                <CardTitle>Extracted Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold">File: {extractedContent.filename}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The content has been populated in the form above for editing. 
                  You can modify it before saving, or save it as-is using the button below.
                </p>
                <div className="mt-3 p-3 bg-yellow-50 rounded">
                  <p className="text-sm">
                    <strong>Editing:</strong> You can edit the content in the form fields above. 
                    Once you're satisfied with the content, click "Save Extracted Content".
                  </p>
                </div>
                <div className="mt-4 bg-muted p-4 rounded max-h-60 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {extractedContent.content}
                  </pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={saveExtractedContent}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Extracted Content"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setExtractedContent(null)}
                    disabled={loading}
                  >
                    Clear Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stored Content</h3>
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created: {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <pre className="mt-2 bg-muted p-4 rounded max-h-40 overflow-auto whitespace-pre-wrap">
                            {item.content}
                          </pre>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
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