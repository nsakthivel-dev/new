import { Link } from "wouter";
import { ArrowRight, Shield, Wifi, BookOpen, Camera, TrendingUp, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@assets/generated_images/hero_farmer_examining_crops.png";
import tomatoIcon from "@assets/generated_images/tomato_crop_icon.png";
import maizeIcon from "@assets/generated_images/maize_crop_icon.png";
import riceIcon from "@assets/generated_images/rice_crop_icon.png";
import wheatIcon from "@assets/generated_images/wheat_crop_icon.png";
import potatoIcon from "@assets/generated_images/potato_crop_icon.png";
import bananaIcon from "@assets/generated_images/banana_crop_icon.png";

const supportedCrops = [
  { name: "Tomato", icon: tomatoIcon },
  { name: "Maize", icon: maizeIcon },
  { name: "Rice", icon: riceIcon },
  { name: "Wheat", icon: wheatIcon },
  { name: "Potato", icon: potatoIcon },
  { name: "Banana", icon: bananaIcon },
];

const features = [
  {
    icon: Wifi,
    title: "Works Offline",
    description: "Diagnose crop diseases even without internet connection",
  },
  {
    icon: Shield,
    title: "Safe Advice",
    description: "Evidence-based recommendations from trusted agricultural experts",
  },
  {
    icon: BookOpen,
    title: "FAO-ICAR Guidelines",
    description: "Following international agricultural research standards",
  },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[85vh] md:h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
        }}
      >
        <div className="container mx-auto px-4 text-center z-10">
          <Badge variant="secondary" className="mb-4 backdrop-blur-sm bg-background/20 text-white" data-testid="badge-hero">
            AI-Powered Crop Diagnosis
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" data-testid="text-hero-title">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8" data-testid="text-hero-subtitle">
            {t("hero.subtitle")}
          </p>
          <Link href="/diagnose">
            <Button size="lg" className="gap-2 backdrop-blur-sm" data-testid="button-upload-photo">
              <Camera className="h-5 w-5" />
              {t("hero.cta")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="mt-12">
            <p className="text-white text-sm mb-4 font-medium">Supported Crops</p>
            <div className="flex justify-center gap-4 overflow-x-auto pb-4">
              {supportedCrops.map(crop => (
                <div
                  key={crop.name}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                  data-testid={`crop-icon-${crop.name.toLowerCase()}`}
                >
                  <div className="w-16 h-16 rounded-full bg-white p-2 shadow-lg">
                    <img src={crop.icon} alt={crop.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="text-white text-xs font-medium">{crop.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Today's Common Diseases in Tamil Nadu</h2>
            <p className="text-muted-foreground">Stay informed about current crop health issues in your district</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-regional-disease-1">
              <CardHeader>
                <Badge variant="destructive" className="w-fit mb-2">High Risk</Badge>
                <CardTitle>Bacterial Wilt in Bananas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Increased bacterial wilt reported in Thanjavur and Tiruchirappalli districts. Look for yellowing leaves.
                </p>
                <Link href="/library">
                  <Button variant="outline" size="sm" data-testid="button-learn-more-1">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-regional-disease-2">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-yellow-500">Medium Risk</Badge>
                <CardTitle>Rice Blast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Monsoon conditions favor rice blast in Coimbatore and Erode districts. Watch for white lesions.
                </p>
                <Link href="/library">
                  <Button variant="outline" size="sm" data-testid="button-learn-more-2">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-regional-disease-3">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Low Risk</Badge>
                <CardTitle>Red Spider Mites</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Low occurrence but monitor tomato crops in Salem and Namakkal districts.
                </p>
                <Link href="/library">
                  <Button variant="outline" size="sm" data-testid="button-learn-more-3">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Leaf className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload a photo of your crop and get instant diagnosis with treatment recommendations
          </p>
          <Link href="/diagnose">
            <Button size="lg" className="gap-2" data-testid="button-get-started">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
