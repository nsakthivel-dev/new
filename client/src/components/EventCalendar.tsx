import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay,
  addDays
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star, Sprout } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description?: string;
  type: "user" | "festival" | "crop";
}

interface Festival {
  date: string;
  name: string;
}

interface CropActivity {
  date: string;
  activity: string;
  season: string;
}

// Specific festival dates (approximate for recurring festivals)
const festivalDates: Festival[] = [
  // January
  { date: "01-14", name: "Pongal" },
  { date: "01-15", name: "Thai Pongal" },
  { date: "01-16", name: "Mattu Pongal" },
  { date: "01-15", name: "Thiruvalluvar Day" },
  
  // February
  { date: "02-15", name: "Maha Shivaratri" },
  
  // March
  { date: "03-20", name: "Panguni Uthiram" },
  
  // April
  { date: "04-01", name: "Tamil New Year" },
  { date: "04-10", name: "Chitra Pournami" },
  
  // May
  { date: "05-05", name: "Vaikasi Visakam" },
  
  // July
  { date: "07-05", name: "Aadi Amavasai" },
  { date: "07-15", name: "Aadi Perukku" },
  
  // August
  { date: "08-15", name: "Krishna Jayanthi" },
  { date: "08-20", name: "Avani Avittam" },
  { date: "08-25", name: "Vinayagar Chaturthi" },
  
  // September
  { date: "09-01", name: "Navratri beginning" },
  
  // October
  { date: "10-01", name: "Ayudha Pooja" },
  { date: "10-05", name: "Vijayadashami" },
  
  // November
  { date: "11-01", name: "Deepavali" },
  { date: "11-15", name: "Karthigai Deepam" },
  
  // December
  { date: "12-15", name: "Margazhi festivals" },
  { date: "12-25", name: "Vaikunta Ekadashi" }
];

// Crop season data with start and end dates
const cropSeasons = [
  {
    name: "Rabi Season",
    startDate: "10-01",
    endDate: "03-31",
    description: "Winter cropping season"
  },
  {
    name: "Kharif Season",
    startDate: "06-01",
    endDate: "09-30",
    description: "Monsoon cropping season"
  },
  {
    name: "Zaid Season",
    startDate: "03-01",
    endDate: "06-30",
    description: "Summer cropping season"
  }
];

// Specific crop activities with season information
const cropActivities: CropActivity[] = [
  // Rabi Season Crops (October to March)
  { date: "10-01", activity: "Rabi season preparation", season: "Rabi" },
  { date: "10-05", activity: "Wheat sowing", season: "Rabi" },
  { date: "10-10", activity: "Barley sowing", season: "Rabi" },
  { date: "10-15", activity: "Pea sowing", season: "Rabi" },
  { date: "10-20", activity: "Mustard sowing", season: "Rabi" },
  { date: "10-25", activity: "Potato planting", season: "Rabi" },
  { date: "11-01", activity: "Onion planting", season: "Rabi" },
  { date: "11-05", activity: "Garlic planting", season: "Rabi" },
  { date: "11-10", activity: "Carrot sowing", season: "Rabi" },
  { date: "11-15", activity: "Cabbage planting", season: "Rabi" },
  { date: "11-20", activity: "Cauliflower planting", season: "Rabi" },
  { date: "11-25", activity: "Radish sowing", season: "Rabi" },
  { date: "12-01", activity: "Spinach sowing", season: "Rabi" },
  { date: "12-05", activity: "Coriander sowing", season: "Rabi" },
  { date: "12-10", activity: "Fenugreek sowing", season: "Rabi" },
  { date: "12-15", activity: "Frost protection measures", season: "Rabi" },
  { date: "12-20", activity: "Irrigation management", season: "Rabi" },
  { date: "12-25", activity: "Pest control measures", season: "Rabi" },
  { date: "01-05", activity: "Harvesting of early rabi crops", season: "Rabi" },
  { date: "01-10", activity: "Fertilizer application", season: "Rabi" },
  { date: "01-15", activity: "Weed control", season: "Rabi" },
  { date: "01-20", activity: "Disease management", season: "Rabi" },
  { date: "02-01", activity: "Harvesting of main rabi crops", season: "Rabi" },
  { date: "02-05", activity: "Post-harvest management", season: "Rabi" },
  { date: "02-10", activity: "Storage preparation", season: "Rabi" },
  { date: "03-01", activity: "End of Rabi season", season: "Rabi" },
  { date: "03-05", activity: "Land preparation for next season", season: "Rabi" },
  { date: "03-10", activity: "Soil testing", season: "Rabi" },
  { date: "03-15", activity: "Manure application", season: "Rabi" },
  { date: "03-20", activity: "Seed treatment", season: "Rabi" },
  { date: "03-25", activity: "Field preparation", season: "Rabi" },
  
  // Kharif Season Crops (June to September)
  { date: "06-01", activity: "Kharif season preparation", season: "Kharif" },
  { date: "06-05", activity: "Rice transplanting", season: "Kharif" },
  { date: "06-10", activity: "Maize sowing", season: "Kharif" },
  { date: "06-15", activity: "Cotton sowing", season: "Kharif" },
  { date: "06-20", activity: "Sugarcane planting", season: "Kharif" },
  { date: "06-25", activity: "Sorghum sowing", season: "Kharif" },
  { date: "07-01", activity: "Pulses sowing", season: "Kharif" },
  { date: "07-05", activity: "Groundnut sowing", season: "Kharif" },
  { date: "07-10", activity: "Sesame sowing", season: "Kharif" },
  { date: "07-15", activity: "Moong dal sowing", season: "Kharif" },
  { date: "07-20", activity: "Urad dal sowing", season: "Kharif" },
  { date: "07-25", activity: "Irrigation scheduling", season: "Kharif" },
  { date: "08-01", activity: "Fertilizer application", season: "Kharif" },
  { date: "08-05", activity: "Weed control", season: "Kharif" },
  { date: "08-10", activity: "Pest management", season: "Kharif" },
  { date: "08-15", activity: "Disease control", season: "Kharif" },
  { date: "08-20", activity: "Intercultural operations", season: "Kharif" },
  { date: "08-25", activity: "Earthing up", season: "Kharif" },
  { date: "09-01", activity: "Harvesting early kharif crops", season: "Kharif" },
  { date: "09-05", activity: "Storage preparation", season: "Kharif" },
  { date: "09-10", activity: "Marketing arrangements", season: "Kharif" },
  { date: "09-15", activity: "Post-harvest handling", season: "Kharif" },
  { date: "09-20", activity: "End of Kharif season", season: "Kharif" },
  { date: "09-25", activity: "Field cleaning", season: "Kharif" },
  
  // Zaid Season Crops (March to June)
  { date: "03-01", activity: "Zaid season preparation", season: "Zaid" },
  { date: "03-05", activity: "Watermelon planting", season: "Zaid" },
  { date: "03-10", activity: "Muskmelon planting", season: "Zaid" },
  { date: "03-15", activity: "Cucumber planting", season: "Zaid" },
  { date: "03-20", activity: "Bitter gourd planting", season: "Zaid" },
  { date: "03-25", activity: "Bottle gourd planting", season: "Zaid" },
  { date: "04-01", activity: "Snake gourd planting", season: "Zaid" },
  { date: "04-05", activity: "Pointed gourd planting", season: "Zaid" },
  { date: "04-10", activity: "Drumstick planting", season: "Zaid" },
  { date: "04-15", activity: "Amaranth sowing", season: "Zaid" },
  { date: "04-20", activity: "Fenugreek sowing", season: "Zaid" },
  { date: "04-25", activity: "Coriander sowing", season: "Zaid" },
  { date: "05-01", activity: "Irrigation management", season: "Zaid" },
  { date: "05-05", activity: "Fertilizer application", season: "Zaid" },
  { date: "05-10", activity: "Pest control", season: "Zaid" },
  { date: "05-15", activity: "Disease management", season: "Zaid" },
  { date: "05-20", activity: "Harvesting early zaid crops", season: "Zaid" },
  { date: "05-25", activity: "Marketing", season: "Zaid" },
  { date: "06-01", activity: "Harvesting main zaid crops", season: "Zaid" },
  { date: "06-05", activity: "Post-harvest handling", season: "Zaid" },
  { date: "06-10", activity: "Storage preparation", season: "Zaid" },
  { date: "06-15", activity: "End of Zaid season", season: "Zaid" }
];

interface EventCalendarProps {
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function EventCalendar({ onPrevMonth, onNextMonth, currentDate: externalCurrentDate, onDateChange }: EventCalendarProps) {
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: ""
  });

  const currentDate = externalCurrentDate || internalCurrentDate;

  const nextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      setInternalCurrentDate(newDate);
    }
    if (onNextMonth) onNextMonth();
  };

  const prevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (onDateChange) {
      onDateChange(newDate);
    } else {
      setInternalCurrentDate(newDate);
    }
    if (onPrevMonth) onPrevMonth();
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  const handleCreateEvent = () => {
    if (selectedDate && newEvent.title) {
      const event: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        date: selectedDate,
        description: newEvent.description,
        type: "user"
      };
      setEvents([...events, event]);
      setNewEvent({ title: "", description: "" });
      setIsDialogOpen(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(startOfMonth(currentDate));

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    // Get today's date for comparison
    const today = new Date();
    
    // Get current year for matching dates
    const currentYear = format(currentDate, "yyyy");

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = events.filter(event => isSameDay(event.date, cloneDay));
        
        // Check if this day is today
        const isToday = isSameDay(day, today);
        
        // Check for festivals on this specific date
        const monthDay = format(day, "MM-dd");
        const festivalsOnDate = festivalDates.filter((fest: Festival) => fest.date === monthDay);
        
        // Check for crop activities on this specific date
        const cropsOnDate = cropActivities.filter((crop: CropActivity) => crop.date === monthDay);
        
        // Create festival events
        const festivalEvents: CalendarEvent[] = festivalsOnDate.map((fest: Festival) => ({
          id: `fest-${fest.date}-${fest.name}`,
          title: fest.name,
          date: day,
          type: "festival"
        }));
        
        // Create crop events
        const cropEvents: CalendarEvent[] = cropsOnDate.map((crop: CropActivity) => ({
          id: `crop-${crop.date}-${crop.activity}`,
          title: crop.activity,
          date: day,
          type: "crop"
        }));
        
        // Combine all events for this day
        const allEvents = [...dayEvents, ...festivalEvents, ...cropEvents];

        days.push(
          <div
            className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors relative ${
              !isSameMonth(day, monthStart)
                ? "bg-muted/50 text-muted-foreground"
                : "bg-background hover:bg-accent"
            } ${
              isToday ? "border-2 border-primary" : ""
            }`}
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
          >
            {/* Today indicator */}
            {isToday && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
            )}
            
            <span className={`text-sm font-medium ${isToday ? "text-primary font-bold" : ""}`}>
              {formattedDate}
            </span>
            <div className="mt-1 space-y-1">
              {allEvents.map(event => (
                <div 
                  key={event.id} 
                  className={`text-xs p-1 rounded truncate ${
                    event.type === "festival" 
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                      : event.type === "crop" 
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-primary text-primary-foreground"
                  }`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Event Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderHeader()}
          <div className="calendar">
            {renderDays()}
            {renderCells()}
          </div>
          
          {/* Crop Seasons Information */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3">Crop Seasons</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cropSeasons.map((season, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg border bg-green-50"
                >
                  <h4 className="font-medium text-green-800">{season.name}</h4>
                  <p className="text-sm text-green-600">{season.description}</p>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Start: {season.startDate}</span>
                    <span>End: {season.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm">Festivals</span>
            </div>
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-green-500" />
              <span className="text-sm">Crop Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-sm">User Events</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? `Create Event for ${format(selectedDate, "PPP")}` : "Create Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Enter event description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}