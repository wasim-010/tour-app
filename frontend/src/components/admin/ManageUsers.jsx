import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Trash2,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

const ManageUsers = ({ groupId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/groups/${groupId}/users`);
      setUsers(response.data);
    } catch (err) {
      toast.error('Failed to load group members.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Email address is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/groups/${groupId}/users`, { email });
      toast.success('New member added to the tour group.');
      setEmail('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveClick = (user) => {
    setUserToRemove(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await api.delete(`/groups/${groupId}/users/${userToRemove.user_id}`);
      toast.success('Member removed from the group.');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member.');
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToRemove(null);
    }
  };

  const members = users.filter(m => m.role !== 'admin');

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Group Members List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" /> Group Members
          </h3>
          <Badge variant="outline" className="border-white/10 text-slate-500 uppercase tracking-tighter">
            {members.length} Members
          </Badge>
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
          ) : (
            members.length > 0 ? (
              members.map(member => (
                <div key={member.user_id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} />
                      <AvatarFallback className="bg-primary/10 text-primary">{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white uppercase tracking-tight truncate">{member.username}</span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{member.email}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="bg-white/5 text-slate-500 h-6 px-2 uppercase text-[10px] tracking-widest border-none">
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveClick(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <p className="text-slate-500 font-medium italic">No members have been added to this group yet.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Add User Form */}
      <div className="lg:col-span-2">
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden sticky top-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5 text-primary" /> Add Member
            </CardTitle>
            <CardDescription>Invite a member to join your tour group.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                <Fingerprint className="h-6 w-6 text-primary mt-1" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Users must have a registered account before they can be added to a tour group.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Email Address</Label>
                <Input
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Member
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
              <ShieldAlert className="h-5 w-5" /> Remove Member?
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will immediately remove <span className="text-white font-medium">{userToRemove?.username}</span> from the group. They will lose access to tour details and expenses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-400">Cancel</Button>
            <Button variant="destructive" onClick={confirmRemoveUser} className="bg-red-600">Remove Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;