import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Receipt,
  Users as UsersIcon,
  Calendar,
  MapPin,
  Target,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Search,
  UserCheck,
  Banknote,
  Hash,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const AdminAddExpense = () => {
  const [groups, setGroups] = useState([]);
  const [itineraries, setItineraries] = useState({});
  const [users, setUsers] = useState({});

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDayId, setSelectedDayId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [actualCost, setActualCost] = useState('');

  const [loading, setLoading] = useState({ groups: true, itinerary: false, users: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use refs to access current state in stable callbacks without triggering identity changes
  const itinerariesRef = useRef(itineraries);
  itinerariesRef.current = itineraries;
  const usersRef = useRef(users);
  usersRef.current = users;

  useEffect(() => {
    const fetchAdminGroups = async () => {
      try {
        const response = await api.get('/groups');
        const adminGroups = response.data.filter(g => g.role === 'admin');
        setGroups(adminGroups);
      } catch (error) {
        toast.error('Failed to load tour groups.');
      } finally {
        setLoading(prev => ({ ...prev, groups: false }));
      }
    };
    fetchAdminGroups();
  }, []);

  const handleGroupChange = useCallback(async (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedDayId(''); setSelectedLocationId(''); setSelectedEventId(''); setSelectedUserIds([]);
    if (!groupId) return;

    setLoading(prev => ({ ...prev, itinerary: true, users: true }));
    try {
      const currentItinerary = itinerariesRef.current[groupId];
      const currentUsers = usersRef.current[groupId];

      if (!currentItinerary) {
        const itineraryRes = await api.get(`/tours/${groupId}`);
        setItineraries(prev => ({ ...prev, [groupId]: itineraryRes.data }));
      }
      if (!currentUsers) {
        const usersRes = await api.get(`/groups/${groupId}/users`);
        setUsers(prev => ({ ...prev, [groupId]: usersRes.data.filter(u => u.role !== 'admin') }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tour details.');
    } finally {
      setLoading(prev => ({ ...prev, itinerary: false, users: false }));
    }
  }, []); // Stable identity

  const availableDays = useMemo(() => itineraries[selectedGroupId]?.days || [], [itineraries, selectedGroupId]);
  const availableLocations = useMemo(() => availableDays.find(d => d.day_id.toString() === selectedDayId)?.locations || [], [availableDays, selectedDayId]);
  const availableEvents = useMemo(() => availableLocations.find(l => l.location_id.toString() === selectedLocationId)?.events || [], [availableLocations, selectedLocationId]);
  const availableUsers = useMemo(() => users[selectedGroupId] || [], [users, selectedGroupId]);

  const toggleUser = useCallback((userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleSelectAllUsers = useCallback((checked) => {
    const allUserIds = availableUsers.map(u => u.user_id.toString());
    setSelectedUserIds(prev => {
      if (checked) {
        // Only update if not all are already selected to avoid extra renders
        if (prev.length === allUserIds.length) return prev;
        return allUserIds;
      } else {
        if (prev.length === 0) return prev;
        return [];
      }
    });
  }, [availableUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId || selectedUserIds.length === 0 || !quantity || !actualCost) {
      toast.warning("Please complete all expense details.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/expenses/admin', {
        event_id: parseInt(selectedEventId),
        user_ids: selectedUserIds.map(id => parseInt(id)),
        quantity: parseInt(quantity),
        actual_cost_per_unit: parseFloat(actualCost),
      });
      toast.success("Expenses logged successfully for all selected members.");
      eventBus.emit('financeDataChanged');
      setSelectedEventId('');
      setSelectedUserIds([]);
      setQuantity(1);
      setActualCost('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Add Batch Expenses</h1>
          <p className="text-slate-400">Add common expenses for multiple members at once.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary">{selectedUserIds.length} Members Selected</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sector Targeting Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="p-4 pb-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">1. Select Group</Label>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loading.groups ? <Skeleton className="h-10 w-full" /> : (
                <Select
                  className="bg-transparent border-white/10"
                  value={selectedGroupId}
                  onChange={e => handleGroupChange(e.target.value)}
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  {groups.map(g => <option key={g.group_id} value={g.group_id} className="bg-slate-900">{g.group_name}</option>)}
                </Select>
              )}
            </CardContent>
          </Card>

          <Card className={cn("border-white/5 bg-slate-900/40 backdrop-blur-md transition-opacity", !selectedGroupId && "opacity-30")}>
            <CardHeader className="p-4 pb-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">2. Select Day</Label>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select
                className="bg-transparent border-white/10"
                value={selectedDayId}
                onChange={e => setSelectedDayId(e.target.value)}
                disabled={!selectedGroupId || loading.itinerary}
              >
                <option value="" className="bg-slate-900">Select...</option>
                {availableDays.map(d => <option key={d.day_id} value={d.day_id} className="bg-slate-900">Day {d.day_number}</option>)}
              </Select>
            </CardContent>
          </Card>

          <Card className={cn("border-white/5 bg-slate-900/40 backdrop-blur-md transition-opacity", !selectedDayId && "opacity-30")}>
            <CardHeader className="p-4 pb-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">3. Location</Label>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select
                className="bg-transparent border-white/10"
                value={selectedLocationId}
                onChange={e => setSelectedLocationId(e.target.value)}
                disabled={!selectedDayId}
              >
                <option value="" className="bg-slate-900">Select...</option>
                {availableLocations.map(l => <option key={l.location_id} value={l.location_id} className="bg-slate-900">{l.location_name}</option>)}
              </Select>
            </CardContent>
          </Card>

          <Card className={cn("border-white/5 bg-slate-900/40 backdrop-blur-md transition-opacity", !selectedLocationId && "opacity-30")}>
            <CardHeader className="p-4 pb-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">4. Event/Activity</Label>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select
                className="bg-transparent border-white/10 font-bold"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                disabled={!selectedLocationId}
              >
                <option value="" className="bg-slate-900">Select...</option>
                {availableEvents.map(ev => <option key={ev.event_id} value={ev.event_id} className="bg-slate-900">{ev.event_name}</option>)}
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Operative Selection */}
          <Card className={cn(
            "border-white/5 bg-slate-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden",
            (!selectedGroupId || loading.users) && "opacity-30 grayscale"
          )}>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-primary" /> Select Members
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={availableUsers.length > 0 && selectedUserIds.length === availableUsers.length}
                    onCheckedChange={handleSelectAllUsers}
                  />
                  <Label htmlFor="select-all" className="text-xs text-slate-400 cursor-pointer">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading.users ? <Skeleton className="h-40 w-full rounded-xl" /> : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-none">
                  {availableUsers.map(u => (
                    <UserSelectItem
                      key={u.user_id}
                      user={u}
                      isSelected={selectedUserIds.includes(u.user_id.toString())}
                      onToggle={toggleUser}
                    />
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-slate-600 italic">
                      No members found in this group.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Parameters */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" /> Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Unit Quantity</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <Input
                      type="number"
                      min="1"
                      className="pl-10 bg-white/5 border-white/10 text-white font-mono"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Unit Cost (৳)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-10 bg-white/5 border-white/10 text-white font-mono text-xl text-primary"
                      value={actualCost}
                      placeholder="0.00"
                      onChange={(e) => setActualCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Transaction Amount</p>
                    <p className="text-2xl font-bold font-mono text-white tracking-tighter italic">
                      ৳{((parseFloat(actualCost) || 0) * (parseInt(quantity) || 0) * selectedUserIds.length).toLocaleString()}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-16 text-xl font-bold shadow-2xl shadow-primary/20 rounded-[1.5rem] bg-gradient-to-r from-primary to-violet-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={isSubmitting || selectedUserIds.length === 0 || !selectedEventId || !actualCost}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Adding Records...
                </>
              ) : (
                <>
                  Add Batch Expenses
                  <CheckCircle2 className="ml-2 h-6 w-6" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};



const UserSelectItem = React.memo(({ user, isSelected, onToggle }) => {
  const userIdStr = user.user_id.toString();

  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer transition-all",
        isSelected
          ? "bg-primary/20 border-primary/40 ring-1 ring-primary/40"
          : "bg-white/5 hover:bg-white/10"
      )}
      onClick={() => onToggle(userIdStr)}
    >
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
          isSelected ? "bg-primary text-primary-foreground" : "text-transparent"
        )}
      >
        <Check className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-white truncate">{user.username}</span>
    </div>
  );
});

UserSelectItem.displayName = "UserSelectItem";

export default AdminAddExpense;