import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  PlusCircle,
  HandCoins,
  Menu,
  X,
  LogOut,
  User,
  Plane,
  ChevronDown,
  Settings,
  Bell,
  Search,
  Compass,
  Shield,
  Calendar,
  ArrowLeftRight,
  CircleUser,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';
import { ModeToggle } from './mode-toggle';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: isAdmin ? 'Finances' : 'My Expenses', path: isAdmin ? '/admin/finances' : '/my-expenses', icon: Wallet },
  ];

  const operationsNav = [
    { name: 'Event Expenses', path: '/admin/event-expenses', icon: ReceiptText },
    { name: 'Add Expense', path: '/admin/add-expense', icon: PlusCircle },
    { name: 'Deposit Funds', path: '/admin/deposit', icon: HandCoins },
  ];

  const NavItem = ({ item, isCollapsed }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link to={item.path} className="block w-full">
        <div className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden mb-1",
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        )}>
          <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-primary/70")} />
          {!isCollapsed && <span className="font-medium text-sm tracking-tight">{item.name}</span>}
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-violet-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card/40 backdrop-blur-3xl z-50 transition-all duration-500 ease-in-out sticky top-0 h-screen",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform">
              <Plane className="h-6 w-6 text-white -rotate-45" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold tracking-tighter italic">
                TRIP<span className="text-primary not-italic">PLANNER</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto scrollbar-none">
          <div>
            {isSidebarOpen && <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-3 mb-4">Core Systems</p>}
            {mainNav.map(item => <NavItem key={item.path} item={item} isCollapsed={!isSidebarOpen} />)}
          </div>

          {isAdmin && (
            <div className="pt-4">
              {isSidebarOpen && <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-3 mb-4">Operations Control</p>}
              {operationsNav.map(item => <NavItem key={item.path} item={item} isCollapsed={!isSidebarOpen} />)}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-500 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <ArrowLeftRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={cn(
          "h-16 sticky top-0 z-40 flex items-center justify-between px-6 transition-all duration-300",
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        )}>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="lg:hidden">
              <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 hover:bg-primary/30 transition-colors">
                <Plane className="h-5 w-5 text-primary -rotate-45" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-mono">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-slate-400">
              <Globe className="h-3 w-3 text-emerald-500 animate-pulse" />
              SIGNAL: OPTIMAL
            </div>

            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

            <ModeToggle />
            
            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-2 hover:bg-white/5 rounded-xl transition-all">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-foreground tracking-tight uppercase">{user?.username}</p>
                    <p className="text-[10px] text-primary/70 font-bold uppercase">{user?.role}</p>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-xl">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border rounded-2xl p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Member Registry</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 opacity-100">
                  <User className="h-4 w-4" />
                  <span>Profile Uplink</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 opacity-100">
                  <Settings className="h-4 w-4" />
                  <span>Global Config</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  className="flex items-center gap-3 p-3 rounded-xl text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-bold uppercase text-xs tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-12rem)]">
            <Outlet />
          </div>

          <footer className="mt-20 pt-8 pb-12 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
              <div>Trip Planner v2.0-stable</div>
              <div className="flex items-center gap-8">
                <span className="hover:text-primary transition-colors cursor-pointer italic underline">Privacy Policy</span>
                <span className="hover:text-primary transition-colors cursor-pointer italic underline">Terms of Service</span>
              </div>
              <div>© 2026 TRIP PLANNER EXPEDITION CONTROL</div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 bottom-0 left-0 w-72 bg-card border-r border-border p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40">
                  <Plane className="h-6 w-6 text-white -rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tighter italic">
                  TRIP<span className="text-primary not-italic">PLANNER</span>
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-slate-400" />
              </Button>
            </div>
            
            <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-3 mb-4">Core Systems</p>
                {mainNav.map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1",
                      location.pathname === item.path
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {isAdmin && (
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-3 mb-4">Operations Control</p>
                  {operationsNav.map(item => (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1",
                        location.pathname === item.path
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppLayout;