import { useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  BookOpen,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

function isActive(path: string, current: string) {
  return current.startsWith(path);
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card overflow-hidden transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className={`flex items-center border-b ${collapsed ? 'justify-between px-3 py-5' : 'gap-2 px-6 py-5'}`}>
        {collapsed ? <span className="text-xl font-bold text-primary">K</span> : <Store className="h-6 w-6 shrink-0 text-primary" />}
        <span className={`text-xl font-bold tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Kapda POS</span>
        <button
          onClick={onToggle}
          className={`flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors w-8 h-8 ${collapsed ? '' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={`flex flex-col items-center gap-2 ${collapsed ? 'px-1 py-6' : 'p-4'}`}>
        <Button
          variant={isActive('/catalogue', location.pathname) ? 'default' : 'ghost'}
          className={collapsed ? 'h-12 w-12 p-0 flex items-center justify-center' : 'w-full justify-start gap-3'}
          onClick={() => navigate('/catalogue')}
          title="Catalogue"
        >
          <BookOpen size={collapsed ? 24 : 20} />
          {!collapsed && <span>Catalogue</span>}
        </Button>
      </nav>

      <div className={`border-t ${collapsed ? 'p-2' : 'p-4'}`}>
        <Button
          variant="ghost"
          className={`${collapsed ? 'w-12 h-12 mx-auto flex items-center justify-center' : 'w-full justify-start gap-3'} text-muted-foreground`}
          onClick={async () => {
            await logout();
            navigate('/login', { replace: true });
          }}
          title="Sign Out"
        >
          <LogOut size={collapsed ? 24 : 20} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
