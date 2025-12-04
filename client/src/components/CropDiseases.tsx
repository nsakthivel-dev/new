import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Leaf, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Disease } from "@shared/schema";
import { DiseaseDetails } from "@/components/DiseaseDetails";

interface CropDiseasesProps {
  cropId: string;
  cropName: string;
  onClose: () => void;
}

export function CropDiseases({ cropId, cropName, onClose }: CropDiseasesProps) {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
  
  const { data: diseases, isLoading, error } = useQuery<Disease[]>({
    queryKey: [`/api/diseases?cropId=${cropId}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Diseases for {cropName}</h2>
          <Button variant="outline" onClick={onClose}>Back to Library</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Diseases for {cropName}</h2>
          <Button variant="outline" onClick={onClose}>Back to Library</Button>
        </div>
        <div className="text-destructive">
          Failed to load diseases. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Diseases for {cropName}</h2>
        <Button variant="outline" onClick={onClose}>Back to Library</Button>
      </div>

      {diseases && diseases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map(disease => (
            <Card key={disease.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{disease.name}</CardTitle>
                  <Badge variant={
                    disease.severity === "high" ? "destructive" : 
                    disease.severity === "medium" ? "default" : "secondary"
                  }>
                    {disease.severity?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disease.symptoms && disease.symptoms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Symptoms
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {disease.symptoms.join(", ")}
                      </p>
                    </div>
                  )}

                  {disease.organicTreatment && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Leaf className="h-4 w-4 text-green-500" />
                        Organic Treatment
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {disease.organicTreatment}
                      </p>
                    </div>
                  )}

                  {disease.chemicalTreatment && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Chemical Treatment
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {disease.chemicalTreatment}
                      </p>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedDiseaseId(disease.id)}
                  >
                    View Full Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No diseases found</h3>
          <p className="text-muted-foreground">No disease information is available for {cropName} at this time.</p>
        </div>
      )}

      {selectedDiseaseId && (
        <DiseaseDetails 
          diseaseId={selectedDiseaseId} 
          open={!!selectedDiseaseId} 
          onClose={() => setSelectedDiseaseId(null)} 
        />
      )}
    </div>
  );
}