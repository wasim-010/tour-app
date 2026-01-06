import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  Search,
  Download,
  PieChart,
  Building,
  User2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import { Button } from '../components/ui/button';
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
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const MobileUserFinanceCard = ({ user }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
          <User2 className="h-4 w-4 text-slate-400" />
        </div>
        <span className="font-medium text-white">{user.username}</span>
      </div>
      <div className="text-right">
        <span className={cn(
          "text-lg font-bold font-mono block",
          user.balance < 0 ? "text-red-400" : "text-primary"
        )}>
          ৳{user.balance.toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net Balance</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
      <div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Deposited</span>
        <span className="text-emerald-400 font-mono font-medium">৳{user.total_deposited.toLocaleString()}</span>
      </div>
      <div className="text-right">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Spent</span>
        <span className="text-orange-400 font-mono font-medium">৳{user.total_spent.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const UserFinanceTable = ({ users }) => (
  <div className="rounded-2xl md:border md:border-white/5 overflow-hidden border-b-0 space-y-4 md:space-y-0">
    {/* Mobile View */}
    <div className="md:hidden space-y-3">
      {users.map(user => (
        <MobileUserFinanceCard key={user.user_id} user={user} />
      ))}
    </div>

    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-white/5">
          <TableRow>
            <TableHead className="text-slate-400">Member</TableHead>
            <TableHead className="text-right text-slate-400">Total Deposited</TableHead>
            <TableHead className="text-right text-slate-400">Total Spent</TableHead>
            <TableHead className="text-right text-slate-400">Net Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.user_id} className={cn(user.balance < 0 && "bg-red-500/5")}>
              <TableCell className="font-medium text-white flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <User2 className="h-4 w-4 text-slate-400" />
                </div>
                <span className="truncate max-w-[120px]">{user.username}</span>
              </TableCell>
              <TableCell className="text-right text-emerald-400 font-mono">৳{user.total_deposited.toLocaleString()}</TableCell>
              <TableCell className="text-right text-orange-400 font-mono">৳{user.total_spent.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold font-mono">
                <span className={user.balance < 0 ? "text-red-400 underline decoration-red-400/30" : "text-primary"}>
                  ৳{user.balance.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const AdminFinances = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminSummary = async () => {
    try {
      const response = await api.get('/finances/admin-summary');
      setData(response.data);
    } catch (err) {
      toast.error('Financial summary data could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
    eventBus.on('financeDataChanged', fetchAdminSummary);
    return () => eventBus.off('financeDataChanged', fetchAdminSummary);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-3xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
      <PieChart className="h-12 w-12 mb-4 opacity-20" />
      <p>No financial archives found.</p>
    </div>
  );

  const { masterSummary, groupSummaries } = data;

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white italic">Finance Overview</h1>
          <p className="text-slate-400">Master oversight of all tour deposits and spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-slate-400 gap-2 w-full md:w-auto">
            <Download className="h-4 w-4" /> Export Audit
          </Button>
        </div>
      </div>

      {/* Master Summary Card */}
      <Card className="relative overflow-hidden border-white/5 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <BarChart3 className="h-4 w-4" /> Global Finance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left space-y-2">
              <p className="text-slate-500 text-sm font-medium">Total Global Balance</p>
              <h2 className={cn(
                "text-6xl md:text-7xl font-bold font-mono tracking-tighter",
                masterSummary.balance < 0 ? "text-red-400" : "text-white"
              )}>
                ৳{masterSummary.balance.toLocaleString()}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                {masterSummary.balance < 0 ? (
                  <Badge variant="destructive" className="animate-pulse">Strategic Deficit</Badge>
                ) : (
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-400">Healthy Balance</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-12 w-full md:w-auto">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Deposited</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">৳{masterSummary.total_deposited.toLocaleString()}</p>
                <p className="text-[10px] text-slate-600 flex items-center gap-1"><ArrowUpCircle className="h-2.5 w-2.5" /> All groups</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Spent</p>
                <p className="text-2xl font-bold font-mono text-orange-400">৳{masterSummary.total_spent.toLocaleString()}</p>
                <p className="text-[10px] text-slate-600 flex items-center gap-1"><ArrowDownCircle className="h-2.5 w-2.5" /> All groups</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group-wise Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2 italic">
            Group Finance Breakdown
            <Badge variant="outline" className="text-slate-500 border-white/10 uppercase tracking-tighter ml-2">
              {groupSummaries?.length} Groups Active
            </Badge>
          </h2>
        </div>

        <Accordion type="multiple" defaultValue={[groupSummaries?.[0]?.group_id.toString()]} className="w-full space-y-4">
          {groupSummaries?.map(group => {
            const memberUsers = group.userSummaries.filter(u => u.role !== 'admin');
            return (
              <AccordionItem key={group.group_id} value={group.group_id.toString()} className="border-none">
                <Card className="border-white/5 bg-slate-900/30 overflow-hidden hover:bg-slate-900/40 transition-all shadow-lg rounded-2xl">
                  <AccordionTrigger className="px-6 py-6 hover:no-underline group">
                    <div className="flex flex-1 items-center justify-between text-left pr-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{group.group_name}</h3>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">{memberUsers.length} Active Members</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge className={cn(
                          "text-sm font-mono py-1 px-3",
                          group.groupSummary.balance < 0 ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                        )}>
                          ৳{group.groupSummary.balance.toLocaleString()}
                        </Badge>
                        <span className="text-[10px] text-slate-600 font-bold uppercase mt-1">Net Balance</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Group Deposits</p>
                          <p className="text-lg font-bold font-mono text-emerald-400">৳{group.groupSummary.total_deposited.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Group Spending</p>
                          <p className="text-lg font-bold font-mono text-orange-400">৳{group.groupSummary.total_spent.toLocaleString()}</p>
                        </div>
                      </div>
                      <UserFinanceTable users={memberUsers} />
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
        {groupSummaries?.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <TrendingUp className="h-12 w-12 mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500">No active expedition archives found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinances;