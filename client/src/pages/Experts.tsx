import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Phone, Mail, Video, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Expert } from "@shared/schema";

export default function Experts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const { data: experts, isLoading } = useQuery<Expert[]>({
    queryKey: ["/api/experts"],
  });

  const filteredExperts = experts?.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === "all" || expert.district === districtFilter;
    const matchesSpecialization = specializationFilter === "all" || expert.specialization?.includes(specializationFilter);
    return matchesSearch && matchesDistrict && matchesSpecialization;
  });

  // Tamil Nadu districts
  const tamilNaduDistricts = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
    "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Thoothukudi",
    "Dindigul", "Krishnagiri", "Namakkal", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Sivaganga", "Theni", "The Nilgiris", "Kanyakumari",
    "Karur", "Ariyalur", "Nagapattinam", "Virudhunagar", "Tiruppur",
    "Cuddalore", "Kallakurichi", "Ranipet", "Tenkasi", "Tirupathur"
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">Agricultural Experts Network - Tamil Nadu</h1>
          <p className="text-muted-foreground">
            Connect with verified extension officers and agricultural specialists in Tamil Nadu
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-experts"
                />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger data-testid="select-district-filter">
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {tamilNaduDistricts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger data-testid="select-specialization-filter">
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="cereals">Cereals</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="cash_crops">Cash Crops</SelectItem>
                  <SelectItem value="pest_management">Pest Management</SelectItem>
                  <SelectItem value="disease_control">Disease Control</SelectItem>
                  <SelectItem value="organic_farming">Organic Farming</SelectItem>
                  <SelectItem value="soil_health">Soil Health</SelectItem>
                  <SelectItem value="water_management">Water Management</SelectItem>
                  <SelectItem value="climate_resilience">Climate Resilience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts?.map(expert => (
              <Card key={expert.id} className="hover-elevate" data-testid={`card-expert-${expert.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12 bg-primary">
                      <AvatarFallback className="text-primary-foreground font-semibold">
                        {expert.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{expert.name}</CardTitle>
                        {expert.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {expert.district}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.specialization?.map(spec => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {expert.languages?.map(lang => (
                      <span key={lang} className="text-xs text-muted-foreground">
                        {lang}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="default" className="w-full" size="sm" data-testid={`button-contact-${expert.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-call-${expert.id}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-video-${expert.id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  {expert.contactEmail && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{expert.contactEmail}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredExperts?.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experts found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        <Card className="mt-12 bg-muted/50">
          <CardHeader>
            <CardTitle>Tamil Nadu Agricultural Advisory Board</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              All experts listed here are verified by Tamil Nadu Agricultural University and follow ICAR guidelines.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="outline">TNAU Certified</Badge>
              <Badge variant="outline">ICAR Approved</Badge>
              <Badge variant="outline">Government Extension</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
