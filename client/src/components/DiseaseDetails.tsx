import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, AlertTriangle, Leaf, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Disease } from "@shared/schema";

interface DiseaseDetailsProps {
  diseaseId: string;
  open: boolean;
  onClose: () => void;
}

export function DiseaseDetails({ diseaseId, open, onClose }: DiseaseDetailsProps) {
  const { data: disease, isLoading, error } = useQuery<Disease>({
    queryKey: [`/api/diseases/${diseaseId}`],
    enabled: !!diseaseId && open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading disease details...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !disease) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Loading Disease Details</DialogTitle>
          </DialogHeader>
          <div className="text-destructive">
            Failed to load disease details. Please try again later.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{disease.name}</DialogTitle>
              <Badge variant={
                disease.severity === "high" ? "destructive" : 
                disease.severity === "medium" ? "default" : "secondary"
              }>
                {disease.severity?.toUpperCase() || "UNKNOWN"} RISK
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symptoms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {disease.symptoms && disease.symptoms.length > 0 ? (
                <ul className="space-y-2">
                  {disease.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No symptoms information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Causes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Causes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {disease.causes ? (
                <p>{disease.causes}</p>
              ) : (
                <p className="text-muted-foreground">No causes information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Organic Treatment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Organic Treatment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {disease.organicTreatment ? (
                <p>{disease.organicTreatment}</p>
              ) : (
                <p className="text-muted-foreground">No organic treatment information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Chemical Treatment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Chemical Treatment</CardTitle>
            </CardHeader>
            <CardContent>
              {disease.chemicalTreatment ? (
                <p>{disease.chemicalTreatment}</p>
              ) : (
                <p className="text-muted-foreground">No chemical treatment information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Prevention Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              {disease.prevention ? (
                <p>{disease.prevention}</p>
              ) : (
                <p className="text-muted-foreground">No prevention information available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Image Gallery */}
        {disease.imageUrls && disease.imageUrls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Disease Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {disease.imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                    <img 
                      src={url} 
                      alt={`${disease.name} - ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}