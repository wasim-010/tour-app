import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  ChevronDown,
  MoreVertical,
  Edit3,
  Trash2,
  User,
  Calendar,
  Banknote,
  Layers,
  ArrowRight,
  Search,
  Filter,
  FileText,
  History,
  AlertCircle,
  Loader2,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { cn } from '../lib/utils';

const EventExpenses = () => {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDetailsEventId, setLoadingDetailsEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/finances/admin/event-summary');
      setSummary(response.data);
    } catch (err) {
      toast.error('Failed to load summary data.');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    eventBus.on('financeDataChanged', fetchSummary);
    return () => eventBus.off('financeDataChanged', fetchSummary);
  }, [fetchSummary]);

  const handleAccordionChange = useCallback(async (eventId) => {
    if (details[eventId]) return;
    setLoadingDetailsEventId(eventId);
    try {
      const response = await api.get(`/finances/event/${eventId}/details`);
      setDetails(prev => ({ ...prev, [eventId]: response.data }));
    } catch (err) {
      toast.error(`Failed to load details for event ${eventId}.`);
    } finally {
      setLoadingDetailsEventId(null);
    }
  }, [details]);

  const refreshDetailsForEvent = useCallback(async (eventId) => {
    setLoadingDetailsEventId(eventId);
    try {
      const response = await api.get(`/finances/event/${eventId}/details`);
      setDetails(prev => ({ ...prev, [eventId]: response.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetailsEventId(null);
    }
  }, []);

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await api.delete(`/expenses/admin/${selectedExpense.expense_id}`);
      toast.success('Expense record deleted successfully.');
      refreshDetailsForEvent(selectedExpense.event_id);
      fetchSummary();
      eventBus.emit('financeDataChanged');
    } catch (error) {
      toast.error('Failed to delete expense.');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredSummary = summary.filter(s =>
    s.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingSummary) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Event Expense Summary</h1>
          <p className="text-slate-400">View detailed costs categorized by tour events.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Filter by event, group, or location..."
            className="pl-10 w-full md:w-80 bg-white/5 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Summary Accordion */}
      <div className="space-y-4">
        {filteredSummary.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-4">
            {filteredSummary.map(event => (
              <AccordionItem key={event.event_id} value={event.event_id.toString()} className="border-none">
                <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden hover:bg-slate-900/60 transition-all rounded-[2rem] shadow-xl">
                  <AccordionTrigger
                    onClick={() => handleAccordionChange(event.event_id)}
                    className="px-6 py-6 hover:no-underline group"
                  >
                    <div className="flex flex-1 items-center justify-between pr-6 text-left">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{event.event_name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-[10px] py-0 border-white/10 text-slate-500 font-normal uppercase tracking-widest">{event.group_name}</Badge>
                            <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {event.location_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Quantity</p>
                          <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none font-mono">Qty: {event.total_quantity}</Badge>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Cost</p>
                          <p className="text-xl font-bold font-mono text-primary tracking-tighter italic">৳{event.total_expense.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
                        <History className="h-3.5 w-3.5" /> User breakdown per event
                      </div>

                      {loadingDetailsEventId === event.event_id ? (
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-12 w-full rounded-xl" />
                          <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                      ) : (
                        details[event.event_id]?.length > 0 ? (
                          <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                              {details[event.event_id].map((detail) => (
                                <div key={detail.expense_id} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/5">
                                  {/* Left Border accent */}
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
                                  
                                  <div className="p-4 pl-5">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${detail.username}`} />
                                          <AvatarFallback className="bg-primary/10 text-primary">{detail.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-bold text-white text-sm">{detail.username}</p>
                                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(detail.expense_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white rounded-full">
                                          <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                                          onClick={() => handleDeleteClick({ ...detail, event_id: event.event_id })}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5">
                                      <div className="text-center px-2">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-0.5">Quantity</span>
                                        <span className="font-mono text-white text-sm">{detail.quantity}</span>
                                      </div>
                                      <div className="w-px h-8 bg-white/10" />
                                      <div className="text-right px-2">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-0.5">Total Cost</span>
                                        <span className="font-mono text-lg font-bold text-primary italic">৳{detail.total_cost.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden bg-black/20">
                              <Table>
                                <TableHeader className="bg-white/5">
                                  <TableRow>
                                    <TableHead className="text-slate-400">User</TableHead>
                                    <TableHead className="text-center text-slate-400">Quantity</TableHead>
                                    <TableHead className="text-right text-slate-400">Cost</TableHead>
                                    <TableHead className="text-right text-slate-400">Timestamp</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {details[event.event_id].map((detail) => (
                                    <TableRow key={detail.expense_id} className="hover:bg-white/5 border-white/10">
                                      <TableCell className="font-medium text-slate-200 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        {detail.username}
                                      </TableCell>
                                      <TableCell className="text-center font-mono">{detail.quantity}</TableCell>
                                      <TableCell className="text-right font-bold font-mono text-white">৳{detail.total_cost.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                                        {new Date(detail.expense_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white rounded-lg">
                                            <Edit3 className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                            onClick={() => handleDeleteClick({ ...detail, event_id: event.event_id })}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-600 italic">
                            No records found for this event.
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-24 text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="inline-flex p-6 bg-white/5 rounded-full text-slate-700">
              <FileText className="h-16 w-16" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-400">No Expenses Recorded</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                No event-based costs have been added yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Deletion Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" /> Delete Expense?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete the expense for <span className="text-white font-medium">{selectedExpense?.username}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600">Delete Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventExpenses;