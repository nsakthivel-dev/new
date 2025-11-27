import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Camera, ChevronRight, ChevronLeft, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Crop, Diagnosis } from "@shared/schema";

const steps = ["Upload Image", "Select Crop", "Symptoms", "Results"];

const symptomOptions = [
  { id: "yellowing", label: "Yellowing leaves" },
  { id: "spots", label: "Spots or lesions" },
  { id: "wilting", label: "Wilting" },
  { id: "stunted", label: "Stunted growth" },
  { id: "holes", label: "Holes in leaves" },
  { id: "discoloration", label: "Discoloration" },
];

export default function Diagnose() {
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const { toast } = useToast();

  const { data: crops } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const diagnosisMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/diagnoses", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setDiagnosisResult(data);
      setStep(3);
      toast({
        title: "Diagnosis Complete",
        description: "Your crop analysis is ready",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleDiagnose = async () => {
    if (!image || !selectedCrop) return;

    diagnosisMutation.mutate({
      cropId: selectedCrop,
      imageUrl: image,
      symptoms,
      userId: null,
    });
  };

  const progressValue = ((step + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Crop Diagnosis Tool</h1>
          <p className="text-muted-foreground">Upload a photo and answer questions to identify crop issues</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= step ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                  data-testid={`step-indicator-${index}`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm hidden md:inline ${index <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:inline" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" data-testid="progress-diagnosis" />
        </div>

        {step === 0 && (
          <Card data-testid="card-step-upload">
            <CardHeader>
              <CardTitle>Upload Leaf Photo</CardTitle>
              <CardDescription>Take a clear photo of the affected plant part</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  data-testid="input-image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {image ? (
                    <img src={image} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" data-testid="img-uploaded-preview" />
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {image && (
                <Button onClick={() => setStep(1)} className="w-full" data-testid="button-next-step">
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card data-testid="card-step-crop">
            <CardHeader>
              <CardTitle>Select Your Crop</CardTitle>
              <CardDescription>Which crop are you diagnosing?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="crop-select">Crop Type</Label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger id="crop-select" data-testid="select-crop">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops?.map(crop => (
                      <SelectItem key={crop.id} value={crop.id} data-testid={`option-crop-${crop.id}`}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)} data-testid="button-prev-step">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setStep(2)} disabled={!selectedCrop} className="flex-1" data-testid="button-next-step">
                  Continue <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card data-testid="card-step-symptoms">
            <CardHeader>
              <CardTitle>Observed Symptoms</CardTitle>
              <CardDescription>Select all symptoms you've noticed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {symptomOptions.map(symptom => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom.id}
                      checked={symptoms.includes(symptom.id)}
                      onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      data-testid={`checkbox-symptom-${symptom.id}`}
                    />
                    <Label htmlFor={symptom.id} className="cursor-pointer">
                      {symptom.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} data-testid="button-prev-step">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleDiagnose} disabled={diagnosisMutation.isPending} className="flex-1" data-testid="button-diagnose">
                  {diagnosisMutation.isPending ? "Analyzing..." : "Get Diagnosis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card data-testid="card-results">
              <CardHeader>
                <CardTitle>Diagnosis Results</CardTitle>
                <CardDescription>Based on your image and symptoms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is an AI-generated diagnosis. Always consult with local agricultural experts for confirmation.
                  </AlertDescription>
                </Alert>

                {diagnosisResult?.aiAnalysis && (
                  <div className="bg-muted rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">Analysis</h3>
                    <p className="text-sm">{diagnosisResult.aiAnalysis}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {diagnosisResult?.results && Array.isArray(diagnosisResult.results) && diagnosisResult.results.map((disease: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{disease.name}</h3>
                        <Badge variant={
                          disease.riskLevel === "high" ? "destructive" :
                          disease.riskLevel === "medium" ? "default" :
                          "secondary"
                        }>
                          {disease.riskLevel === "high" ? "High Risk" :
                           disease.riskLevel === "medium" ? "Medium Risk" :
                           "Low Risk"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium" data-testid={`text-confidence-${index + 1}`}>
                            {Math.round(disease.confidence * 100)}%
                          </span>
                        </div>
                        <Progress value={disease.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {diagnosisResult?.recommendations && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Recommended Actions</h3>
                    <p className="text-sm whitespace-pre-line">{diagnosisResult.recommendations}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setStep(0); setImage(null); setSelectedCrop(""); setSymptoms([]); }} data-testid="button-new-diagnosis">
                    New Diagnosis
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-download-report">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
