import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlarmClock,
  AlertCircle,
  Calendar,
  MapPin,
  Banknote,
  MessageSquareQuote,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { cn } from '../../lib/utils';

const ManageEvents = ({ groupId, days, onDataChange }) => {
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDayId && days) {
      const selectedDay = days.find(d => d.day_id.toString() === selectedDayId);
      setLocations(selectedDay ? selectedDay.locations : []);
      setSelectedLocationId('');
      setEvents([]);
    } else {
      setLocations([]);
    }
  }, [selectedDayId, days]);

  useEffect(() => {
    if (selectedLocationId && locations) {
      const selectedLocation = locations.find(l => l.location_id.toString() === selectedLocationId);
      setEvents(selectedLocation ? selectedLocation.events : []);
    } else {
      setEvents([]);
    }
  }, [selectedLocationId, locations]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventName || cost === '') {
      toast.warning('Event details incomplete. Name and Estimated Cost are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/tours/locations/${selectedLocationId}/events`, {
        event_name: eventName,
        description,
        estimated_cost_per_unit: parseFloat(cost),
        event_time: eventTime,
        reminder_minutes: parseInt(reminderMinutes)
      });
      toast.success('Event added to the location.');
      setEventName(''); setDescription(''); setCost(''); setEventTime(''); setReminderMinutes('0');
      onDataChange();
    } catch (error) {
      toast.error('Failed to add event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await api.delete(`/tours/events/${selectedEvent.event_id}`);
      toast.success('Event deleted.');
      onDataChange();
    } catch (error) {
      toast.error('Failed to delete event.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Existing Events List */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" /> Events & Activities
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">1. Select Day</Label>
              <Select
                className="bg-white/5 border-white/10 text-white"
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
              >
                <option value="" className="bg-slate-900">-- Select Day --</option>
                {days && days.map(day => (
                  <option key={day.day_id} value={day.day_id} className="bg-slate-900">Day {day.day_number}: {day.title}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">2. Select Location</Label>
              <Select
                className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                disabled={!selectedDayId}
              >
                <option value="" className="bg-slate-900">-- Select Location --</option>
                {locations.map(loc => (
                  <option key={loc.location_id} value={loc.location_id} className="bg-slate-900">{loc.location_name}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {selectedLocationId ? (
            events.length > 0 ? (
              events.map(evt => (
                <div key={evt.event_id} className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase tracking-tight">{evt.event_name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Banknote className="h-3 w-3" /> ৳{evt.estimated_cost_per_unit.toLocaleString()}
                        </span>
                        {evt.event_time && (
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {evt.event_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteClick(evt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <p className="text-slate-500 font-medium italic">No events found at this location.</p>
              </div>
            )
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02] flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-slate-600 opacity-20" />
              <p className="text-slate-600 font-medium">Select a location to manage its events.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Event Form */}
      <div className="lg:col-span-2">
        <Card className={cn(
          "border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden transition-all duration-500 sticky top-8",
          !selectedLocationId && "opacity-30 grayscale pointer-events-none"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-primary" /> Add Event
            </CardTitle>
            <CardDescription>Add a new event or activity for this location stop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Event Name</Label>
                <Input
                  className="bg-white/5 border-white/10 text-white"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Traditional Dinner"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Event Time</Label>
                  <Input
                    type="time"
                    className="bg-white/5 border-white/10 text-white"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Reminder</Label>
                  <Select
                    className="bg-white/5 border-white/10 text-white"
                    value={reminderMinutes.toString()}
                    onChange={(e) => setReminderMinutes(e.target.value)}
                    disabled={!eventTime}
                  >
                    <option value="0" className="bg-slate-900">No Alert</option>
                    <option value="15" className="bg-slate-900">15m before</option>
                    <option value="30" className="bg-slate-900">30m before</option>
                    <option value="60" className="bg-slate-900">1h before</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Estimated Cost (৳)</Label>
                <Input
                  type="number"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Budget Per Participant"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                  <MessageSquareQuote className="h-3 w-3 text-primary" /> Event Description
                </Label>
                <Textarea
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about this event..."
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 mt-4"
                disabled={isSubmitting || !selectedLocationId || !eventName || cost === ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Event
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Deletion Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" /> Delete Event?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently remove <span className="text-white font-medium">{selectedEvent?.event_name}</span> from this location. All associated historical data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600">Delete Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageEvents;