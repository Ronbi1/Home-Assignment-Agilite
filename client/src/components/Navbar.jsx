import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package, Headphones, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import { Button } from './ui/button.jsx';
import { cn } from '../lib/utils.js';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets/new', icon: PlusCircle, label: 'New Ticket' },
  { to: '/products', icon: Package, label: 'Products' },
];

function SidebarContent() {
  return (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-border/80 p-4">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
        <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-secondary" />
      </div>
    </>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/80 bg-card/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Headphones size={16} className="text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">SupportDesk</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-secondary" />
          <Button
            onClick={() => setMobileOpen((prev) => !prev)}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-14 flex w-64 flex-col border-r border-border bg-card text-card-foreground">
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 border-r border-border bg-card text-card-foreground md:flex md:flex-col">
        <div className="border-b border-border/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Headphones size={16} className="text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">SupportDesk</span>
          </div>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
