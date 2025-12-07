import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";
import { Trash2, Plus, Edit, Save, X, Sprout } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

interface CropLibraryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: any; // Firebase timestamp
}

export default function CropLibraryManager() {
  const [items, setItems] = useState<CropLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: ""
  });
  const { toast } = useToast();

  // Fetch content from Firebase
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getCropLibraryContent();
      setItems(data);
    } catch (error: any) {
      console.error("Error fetching crop library content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch crop library content: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing item
        await firebaseService.updateCropLibraryContent(editingId, formData);
        toast({
          title: "Success",
          description: "Crop library item updated successfully",
        });
      } else {
        // Add new item
        await firebaseService.addCropLibraryContent(formData);
        toast({
          title: "Success",
          description: "Crop library item added successfully",
        });
      }
      
      // Reset form
      setFormData({ title: "", content: "", category: "" });
      setEditingId(null);
      
      // Refresh the list
      fetchContent();
    } catch (error: any) {
      console.error("Error saving crop library item:", error);
      toast({
        title: "Error",
        description: "Failed to save crop library item: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: CropLibraryItem) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category
    });
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", content: "", category: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from Firebase
      await firebaseService.deleteCropLibraryContent(id);
      
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      
      toast({
        title: "Success",
        description: "Crop library item deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting crop library item:", error);
      toast({
        title: "Error",
        description: "Failed to delete crop library item: " + error.message,
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
      {/* Add/Edit Form */}
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            {editingId ? (
              <>
                <Edit className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Edit Crop Library Item</CardTitle>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Add New Crop Library Item</CardTitle>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Vegetables, Fruits, Cereals"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter detailed content about the crop..."
                rows={6}
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Item
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
              
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Content List */}
      <Card className="shadow-md">
        <CardHeader className="border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Crop Library Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading crop library items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">No crop library items found</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first item using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                          {item.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                          className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                          className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
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