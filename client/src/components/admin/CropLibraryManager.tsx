import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from "@/lib/firebase";
import { Trash2, Plus, Edit, Save, X } from "lucide-react";

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
    <div className="container mx-auto py-6">
      {/* Page Header - Using common AdminHeader instead */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Crop Library Manager</h1>
        <p className="text-muted-foreground">
          Manage crop library content that will be displayed on the public crop library page
        </p>
      </div>

      {/* Add/Edit Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Crop Library Item" : "Add New Crop Library Item"}
          </CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Crop Library Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="text-center py-8">
              <p>Loading crop library items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No crop library items found. Add your first item above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
}