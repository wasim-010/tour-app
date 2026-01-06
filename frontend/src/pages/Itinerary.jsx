import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Maximize2,
  Plus,
  ChevronRight,
  Navigation,
  Info,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import AddExpenseModal from '../components/AddExpenseModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  } catch (e) {
    return '';
  }
};

const Itinerary = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('Tour Itinerary');
  const [userRole, setUserRole] = useState('member');
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const handleAddExpenseClick = (event) => {
    setSelectedEvent(event);
    setIsAddExpenseOpen(true);
  };

  const fetchItineraryData = async () => {
    if (!groupId || !user) return;
    try {
      const [itineraryRes, groupsRes] = await Promise.all([
        api.get(`/tours/${groupId}`),
        api.get('/groups'),
      ]);
      setItinerary(itineraryRes.data);
      const currentGroup = groupsRes.data.find(g => g.group_id.toString() === groupId);
      if (currentGroup) {
        setGroupName(currentGroup.group_name);
        setUserRole(currentGroup.role);
      }
    } catch (err) {
      toast.error('Failed to load itinerary details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraryData();
  }, [groupId, user]);

  const activeDayPins = useMemo(() => {
    if (!itinerary || !itinerary.days[activeDayIndex]) return [];
    const activeDay = itinerary.days[activeDayIndex];
    return (activeDay?.locations || [])
      .filter(loc => loc.latitude != null && loc.longitude != null)
      .map(loc => ({
        id: loc.location_id,
        name: (loc.events && loc.events.length > 0) ? loc.events[0].event_name : loc.location_name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        order_in_day: loc.order_in_day,
        location_name: loc.location_name
      }));
  }, [itinerary, activeDayIndex]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4 md:p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!itinerary?.days?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-6 bg-white/5 rounded-full text-slate-600">
          <CalendarDays className="h-16 w-16" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{groupName}</h2>
          <p className="text-slate-500 mt-2">No itinerary has been set for this journey yet.</p>
        </div>
      </div>
    );
  }

  const currentDay = itinerary.days[activeDayIndex];

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
                Trip Details
              </Badge>
              <Badge variant="outline" className="text-slate-400 border-white/10 uppercase tracking-tighter">
                Group: {userRole}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight italic">
              {groupName}
            </h1>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Days Tabs */}
      <Tabs defaultValue={itinerary.days[0]?.day_id.toString()} className="w-full" onValueChange={(val) => {
        const index = itinerary.days.findIndex(d => d.day_id.toString() === val);
        setActiveDayIndex(index);
      }}>
        <TabsList className="w-full flex justify-start overflow-x-auto bg-transparent border-b border-white/5 h-auto p-0 mb-8 pb-2 gap-2 scrollbar-none">
          {itinerary.days.map((day) => (
            <TabsTrigger
              key={day.day_id}
              value={day.day_id.toString()}
              className="px-6 py-4 rounded-xl border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 text-slate-400 whitespace-nowrap"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Day {day.day_number}</span>
                <span className="text-base font-semibold">{day.title}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {itinerary.days.map((day, dIdx) => (
          <TabsContent key={day.day_id} value={day.day_id.toString()} className="space-y-8 mt-0 border-none outline-none">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: List of items */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      Today's Route
                    </h3>
                    <Badge variant={day.status === 'Ongoing' ? 'success' : 'secondary'} className="rounded-md">
                      {day.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                    {day.description || 'No specific description for today.'}
                  </p>
                </div>

                <Accordion type="multiple" defaultValue={[day.locations?.[0]?.location_id.toString()]} className="w-full space-y-3">
                  {(day.locations || []).map((loc, idx) => (
                    <AccordionItem key={loc.location_id} value={loc.location_id.toString()} className="border-none">
                      <Card className="border-white/5 bg-slate-900/30 overflow-hidden hover:bg-slate-900/50 transition-colors">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-transparent">
                          <div className="flex flex-1 items-center gap-4 text-left">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200">{loc.location_name}</span>
                              {(loc.start_time || loc.end_time) && (
                                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(loc.start_time)} {loc.end_time && ` - ${formatTime(loc.end_time)}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <div className="space-y-4 pt-2">
                            {loc.events?.map(event => (
                              <div key={event.event_id} className="p-4 bg-white/5 rounded-2xl border border-white/5 group relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-start">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                      {event.event_name}
                                      {event.event_time && <Badge variant="outline" className="text-[10px] py-0 border-white/10 opacity-60 font-normal">{formatTime(event.event_time)}</Badge>}
                                    </h4>
                                    {event.description && <p className="text-xs text-slate-400 max-w-[200px]">{event.description}</p>}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-primary italic">৳{event.estimated_cost_per_unit.toFixed(0)}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Budget</p>
                                  </div>
                                </div>
                                {userRole !== 'admin' && day.status === 'Ongoing' && (
                                  <Button
                                    size="sm"
                                    className="w-full mt-4 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 rounded-xl"
                                    onClick={() => handleAddExpenseClick(event)}
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Expense
                                  </Button>
                                )}
                              </div>
                            ))}
                            {(!loc.events || loc.events.length === 0) && (
                              <p className="text-xs text-slate-600 font-italic text-center py-2">No specific events planned here yet.</p>
                            )}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Right Column: Map and Day Summary */}
              <div className="lg:col-span-2 space-y-8 sticky top-24">
                <Card className="border-white/5 bg-slate-900/60 backdrop-blur-md overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Today's Map
                      </CardTitle>
                      <CardDescription>
                        View your route for Day {day.day_number}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                          <Maximize2 className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden border-white/10 bg-black">
                        <div className="w-full h-full relative">
                          <MapView pins={activeDayPins} />
                          <div className="absolute top-6 left-6 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-xs">
                            <h3 className="font-bold text-white mb-1">Interactive Map</h3>
                            <p className="text-xs text-slate-400">Viewing the full route for {day.title}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[450px] relative bg-slate-800">
                      <MapView pins={activeDayPins} />
                      {/* Luxury Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/20 rounded-xl">
                            <Navigation className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Planned Stops</p>
                            <p className="text-sm font-semibold text-white">{(day.locations || []).length} Total Stops</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary gap-1 group">
                          Open in Maps
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default Itinerary;