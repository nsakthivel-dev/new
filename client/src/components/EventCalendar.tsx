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

// Specific festival dates (approximate for recurring festivals)
const festivalDates = [
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

// Specific crop activity dates (approximate for recurring activities)
const cropDates = [
  // January
  { date: "01-01", activity: "Samba harvest" },
  { date: "01-05", activity: "Groundnut sowing" },
  { date: "01-10", activity: "Sunflower planting" },
  { date: "01-20", activity: "Rice nursery preparation" },
  
  // February
  { date: "02-01", activity: "Sesame sowing" },
  { date: "02-05", activity: "Millet sowing" },
  { date: "02-10", activity: "Sugarcane irrigation" },
  { date: "02-20", activity: "Land prep for Kuruvai" },
  
  // March
  { date: "03-01", activity: "Summer vegetable sowing" },
  { date: "03-05", activity: "Lady's finger planting" },
  { date: "03-10", activity: "Brinjal planting" },
  { date: "03-15", activity: "Tomato planting" },
  { date: "03-20", activity: "Rice nursery (early kuruvai)" },
  
  // April
  { date: "04-01", activity: "Short-term vegetable sowing" },
  { date: "04-05", activity: "Green gram sowing" },
  { date: "04-10", activity: "Black gram sowing" },
  { date: "04-15", activity: "Land preparation for Kuruvai paddy" },
  
  // May
  { date: "05-01", activity: "Cotton sowing" },
  { date: "05-05", activity: "Maize cultivation" },
  { date: "05-10", activity: "Kuruvai preparation" },
  { date: "05-15", activity: "Drip irrigation crops" },
  
  // June
  { date: "06-01", activity: "Kuruvai planting" },
  { date: "06-05", activity: "Turmeric planting" },
  { date: "06-10", activity: "Banana planting" },
  { date: "06-15", activity: "Sugarcane planting" },
  { date: "06-20", activity: "Rainwater harvesting work" },
  
  // July
  { date: "07-01", activity: "Kuruvai crop management" },
  { date: "07-05", activity: "Sorghum planting" },
  { date: "07-10", activity: "Pearl millet planting" },
  { date: "07-15", activity: "Fertilizer for banana" },
  
  // August
  { date: "08-01", activity: "Samba nursery" },
  { date: "08-05", activity: "Fodder crops" },
  { date: "08-10", activity: "Maize fertilizer application" },
  
  // September
  { date: "09-01", activity: "Samba paddy planting" },
  { date: "09-05", activity: "Mustard sowing" },
  { date: "09-10", activity: "Sesame sowing" },
  { date: "09-15", activity: "Rice pest control" },
  
  // October
  { date: "10-01", activity: "Samba irrigation" },
  { date: "10-05", activity: "Rabi season preparation" },
  { date: "10-10", activity: "Planting chillies" },
  { date: "10-15", activity: "Planting onion" },
  { date: "10-20", activity: "Planting carrot" },
  
  // November
  { date: "11-01", activity: "Groundnut sowing" },
  { date: "11-05", activity: "Green gram sowing" },
  { date: "11-10", activity: "Kuruvai harvest" },
  { date: "11-15", activity: "Winter vegetable planting" },
  
  // December
  { date: "12-01", activity: "Rabi crops like wheat" },
  { date: "12-05", activity: "Maize planting" },
  { date: "12-10", activity: "Chickpea planting" },
  { date: "12-15", activity: "Frost/pest control" }
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
        const festivalsOnDate = festivalDates.filter(fest => fest.date === monthDay);
        
        // Check for crop activities on this specific date
        const cropsOnDate = cropDates.filter(crop => crop.date === monthDay);
        
        // Create festival events
        const festivalEvents: CalendarEvent[] = festivalsOnDate.map(fest => ({
          id: `fest-${fest.date}-${fest.name}`,
          title: fest.name,
          date: day,
          type: "festival"
        }));
        
        // Create crop events
        const cropEvents: CalendarEvent[] = cropsOnDate.map(crop => ({
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