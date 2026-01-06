import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  History,
  AlertCircle,
  BadgeCent,
  User,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import eventBus from '../services/eventBus';
import AddDepositModal from '../components/admin/AddDepositModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const MobileGroupFinanceCard = ({ user }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 mb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5 uppercase">
          {user.username.substring(0, 2)}
        </div>
        <span className="font-bold text-white uppercase tracking-tight">{user.username}</span>
      </div>
      <div className={cn(
        "font-mono font-bold text-lg tracking-tighter italic",
        user.balance < 0 ? "text-red-400" : "text-primary"
      )}>
        ৳{user.balance.toLocaleString()}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
      <div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Deposited</span>
        <span className="text-emerald-400/80 font-mono font-bold">৳{user.total_deposited.toLocaleString()}</span>
      </div>
      <div className="text-right">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Spent</span>
        <span className="text-orange-400/80 font-mono font-bold">৳{user.total_spent.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const GroupFinances = () => {
  const { groupId } = useParams();
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const fetchFinances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finances/group/${groupId}`);
      setSummary(response.data.groupSummary);
      setUsers(response.data.userSummaries);
    } catch (err) {
      toast.error('Failed to retrieve financial data.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchFinances();
    eventBus.on('financeDataChanged', fetchFinances);
    return () => eventBus.off('financeDataChanged', fetchFinances);
  }, [fetchFinances]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  const memberUsers = users.filter(user => user.role !== 'admin');

  return (
    <div className="space-y-8 fade-in">
      {/* Breadcrumbs & Header */}
      <div className="space-y-4">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300">Group Finances</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white italic">Group Financial Summary</h1>
            <p className="text-slate-400">Manage deposits and oversee individual member balances.</p>
          </div>
          <Button
            onClick={() => setIsDepositOpen(true)}
            className="h-12 px-6 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/80"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Deposit
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-20 w-20 text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Deposits</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono tracking-tighter text-emerald-400">
                ৳{summary.total_deposited.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                  Aggregate Funding
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingDown className="h-20 w-20 text-orange-400" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Expenditures</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono tracking-tighter text-orange-400">
                ৳{summary.total_spent.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-orange-500/20 text-orange-500 bg-orange-500/5">
                  Confirmed Outflow
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="h-20 w-20 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Global Balance</CardDescription>
              <CardTitle className={cn(
                "text-4xl font-bold font-mono tracking-tighter",
                summary.balance < 0 ? "text-red-400" : "text-primary"
              )}>
                ৳{summary.balance.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                {summary.balance < 0 ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Over Budget
                  </Badge>
                ) : (
                  <Badge variant="success" className="bg-primary/10 text-primary border-none">
                    In Good Standing
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Table */}
      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Individual Member Balances</CardTitle>
              <CardDescription>Breakdown of deposits and spending per group member.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View */}
          <div className="md:hidden p-4 space-y-4">
            {memberUsers.map(user => (
              <MobileGroupFinanceCard key={user.user_id} user={user} />
            ))}
            {memberUsers.length === 0 && (
              <div className="text-center text-slate-500 italic py-8">
                No active members found.
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400 py-4 pl-6 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Member
                  </TableHead>
                  <TableHead className="text-right text-slate-400 pr-6">Deposited</TableHead>
                  <TableHead className="text-right text-slate-400 pr-6">Spent</TableHead>
                  <TableHead className="text-right text-slate-400 pr-6">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberUsers.map((user) => (
                  <TableRow key={user.user_id} className={cn(
                    "border-white/5 hover:bg-white/5 transition-colors group",
                    user.balance < 0 && "bg-red-500/5"
                  )}>
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5 group-hover:border-primary/50 transition-colors uppercase">
                          {user.username.substring(0, 2)}
                        </div>
                        <span className="font-bold text-white uppercase tracking-tight">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-bold text-emerald-400/80">
                      ৳{user.total_deposited.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-mono font-bold text-orange-400/80">
                      ৳{user.total_spent.toLocaleString()}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right pr-6 font-mono font-bold text-lg tracking-tighter italic",
                      user.balance < 0 ? "text-red-400" : "text-primary"
                    )}>
                      ৳{user.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {memberUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500 italic">
                      No active members found in this group.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddDepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        groupId={groupId}
        users={memberUsers}
        onDepositSuccess={fetchFinances}
      />
    </div>
  );
};

export default GroupFinances;