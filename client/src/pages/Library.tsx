import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Bug, Microscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Crop, Disease } from "@shared/schema";
import diseaseImage from "@assets/generated_images/tomato_disease_example.png";
import { CropDiseases } from "@/components/CropDiseases";

const categories = [
  { id: "all", label: "All Crops" },
  { id: "vegetables", label: "Vegetables" },
  { id: "cereals", label: "Cereals" },
  { id: "fruits", label: "Fruits" },
  { id: "pulses", label: "Pulses" },
  { id: "cash_crops", label: "Cash Crops" },
];

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<{id: string, name: string} | null>(null);

  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const filteredCrops = crops?.filter(crop => {
    const matchesCategory = selectedCategory === "all" || crop.category === selectedCategory;
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // If a crop is selected, show its diseases
  if (selectedCrop) {
    return (
      <CropDiseases 
        cropId={selectedCrop.id} 
        cropName={selectedCrop.name} 
        onClose={() => setSelectedCrop(null)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Bug className="h-8 w-8 text-primary" />
            Crop Diseases & Pests Library
          </h1>
          <p className="text-muted-foreground">
            Comprehensive guides on crop diseases, pests, and organic control methods
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops or diseases..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-crops"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} data-testid={`tab-category-${cat.id}`}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops?.map(crop => (
              <Card key={crop.id} className="hover-elevate overflow-hidden" data-testid={`card-crop-${crop.id}`}>
                <div className="h-48 bg-muted flex items-center justify-center">
                  {crop.imageUrl ? (
                    <img src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Microscope className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{crop.category}</Badge>
                  </div>
                  <CardTitle>{crop.name}</CardTitle>
                  {crop.scientificName && (
                    <p className="text-sm text-muted-foreground italic">{crop.scientificName}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {crop.description || "Detailed information about common diseases and pests affecting this crop."}
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm" 
                      data-testid={`button-view-diseases-${crop.id}`}
                      onClick={() => setSelectedCrop({id: crop.id, name: crop.name})}
                    >
                      View Diseases & Pests
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" data-testid={`button-download-card-${crop.id}`}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Field Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCrops?.length === 0 && (
          <div className="text-center py-12">
            <Microscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No crops found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}

        <Card className="mt-12 bg-muted/50">
          <CardHeader>
            <CardTitle>Disease Gallery Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <img src={diseaseImage} alt="Tomato Late Blight" className="w-full h-48 object-cover rounded-lg" />
                <h4 className="font-semibold">Late Blight</h4>
                <p className="text-sm text-muted-foreground">Brown lesions with white mold</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Early Symptoms</span>
                </div>
                <h4 className="font-semibold">Early Detection</h4>
                <p className="text-sm text-muted-foreground">Small dark spots on leaves</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Healthy Comparison</span>
                </div>
                <h4 className="font-semibold">Healthy Leaf</h4>
                <p className="text-sm text-muted-foreground">For comparison purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}