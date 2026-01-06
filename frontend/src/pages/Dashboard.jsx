import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Settings,
  Trash2,
  Users,
  Calendar,
  ArrowRight,
  Search,
  MapPin,
  AlertCircle
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      const userGroups = response.data;
      setGroups(userGroups);

      if (user && user.role !== 'admin' && userGroups?.length === 1) {
        navigate(`/group/${userGroups[0].group_id}/itinerary`, { replace: true });
      }
    } catch (err) {
      toast.error('Failed to load your tour groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const handleDeleteClick = (e, group) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedGroup) return;
    try {
      await api.delete(`/groups/${selectedGroup.group_id}`);
      toast.success('Group dissolved successfully.');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to delete the group.');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-violet-600 p-6 md:p-12 shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Hello, {user?.username} ✈️
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Ready for your next adventure? Manage your tour groups and keep track of every detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user?.role === 'admin' && (
              <Link to="/groups/new">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl">
                  <Plus className="mr-2 h-5 w-5" />
                  New Tour
                </Button>
              </Link>
            )}
            <div className="relative flex-1 w-full sm:w-auto min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/60" />
              <Input
                placeholder="Search tours..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white border-none backdrop-blur-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Groups Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Your Tours
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {filteredGroups.length}
            </Badge>
          </h2>
        </div>

        {filteredGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => {
              const isGroupAdmin = group.role === 'admin';
              const destination = isGroupAdmin
                ? `/admin/group/${group.group_id}`
                : `/group/${group.group_id}/itinerary`;

              return (
                <Link key={group.group_id} to={destination} className="group">
                  <Card className="h-full border-white/5 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 group overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors italic">
                          {group.group_name}
                        </CardTitle>
                        {isGroupAdmin && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-slate-400 mt-2">
                        {group.description || 'No description provided for this tour.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        Multiple Locations
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Group: {group.role}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex items-center justify-between border-t border-white/5 mt-4 pt-4">
                      <div className="flex items-center gap-2">
                        {isGroupAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={(e) => handleDeleteClick(e, group)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-white/10 bg-transparent py-12">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full text-slate-600">
                <Search className="h-12 w-12" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-medium text-slate-300">No tours found</p>
                <p className="text-slate-500">
                  {searchTerm ? "Try a different search term" : "You haven't been added to any tour groups yet."}
                </p>
              </div>
              {user?.role === 'admin' && (
                <Link to="/groups/new">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                    Create your first group
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deletion Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Delete Tour?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently delete <span className="text-white font-medium">{selectedGroup?.group_name}</span> and all associated items, days, and finances. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">
              Keep it
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;