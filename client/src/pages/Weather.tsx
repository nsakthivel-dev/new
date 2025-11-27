import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud, MapPin, Thermometer, Droplets, Wind, Eye, Sun, CloudRain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    uv: number;
    cloud: number;
    feelslike_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      };
    }>;
  };
}

export default function Weather() {
  const { t } = useLanguage();
  const [location, setLocation] = useState("Chennai");
  const [searchLocation, setSearchLocation] = useState("Chennai");

  const { data: weather, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ["weather", location],
    queryFn: async () => {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      return response.json();
    },
    enabled: false, // Don't fetch automatically on mount
  });

  const handleSearch = () => {
    setLocation(searchLocation);
    refetch();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Tamil Nadu major cities for suggestions
  const tamilNaduCities = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
    "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Thoothukudi"
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("weather.title")}</h1>
          <p className="text-muted-foreground">
            Weather information for Tamil Nadu agricultural regions
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Enter a city in Tamil Nadu"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>{t("weather.search_button")}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Quick search:</span>
              {tamilNaduCities.slice(0, 5).map(city => (
                <Button 
                  key={city} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchLocation(city);
                    setLocation(city);
                    refetch();
                  }}
                >
                  {city}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="animate-pulse h-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48" />
              ))}
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Weather</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Failed to load weather data"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : weather ? (
          <div className="space-y-6">
            {/* Current Weather */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {weather.location.name}, {weather.location.country}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https:${weather.current.condition.icon}`} 
                      alt={weather.current.condition.text}
                      className="w-24 h-24"
                    />
                    <div>
                      <div className="text-5xl font-bold">
                        {weather.current.temp_c}°C
                      </div>
                      <div className="text-muted-foreground">
                        Feels like {weather.current.feelslike_c}°C
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Condition</div>
                        <div className="font-medium">{weather.current.condition.text}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Humidity</div>
                        <div className="font-medium">{weather.current.humidity}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Wind</div>
                        <div className="font-medium">{weather.current.wind_kph} kph {weather.current.wind_dir}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">UV Index</div>
                        <div className="font-medium">{weather.current.uv}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-sm text-muted-foreground">Precipitation</div>
                        <div className="font-medium">{weather.current.precip_mm} mm</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Pressure</div>
                        <div className="font-medium">{weather.current.pressure_mb} mb</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forecast */}
            <div>
              <h2 className="text-2xl font-bold mb-4">3-Day Forecast</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weather.forecast.forecastday.map((day, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="font-bold mb-2">
                          {index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDate(day.date)}
                        </div>
                        <img 
                          src={`https:${day.day.condition.icon}`} 
                          alt={day.day.condition.text}
                          className="w-16 h-16 mx-auto"
                        />
                        <div className="font-medium my-2">{day.day.condition.text}</div>
                        <div className="flex justify-center gap-4 mt-2">
                          <span className="text-red-500 font-bold">{day.day.maxtemp_c}°</span>
                          <span className="text-blue-500 font-bold">{day.day.mintemp_c}°</span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <CloudRain className="h-4 w-4 inline mr-1" />
                          {day.day.chance_of_rain}% chance of rain
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Search for Weather</h3>
              <p className="text-muted-foreground">
                Enter a location above to get current weather information and forecasts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}