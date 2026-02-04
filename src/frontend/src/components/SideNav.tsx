import { Link, useRouterState } from '@tanstack/react-router';
import { BarChart3, Settings, Bot, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/market-watch', label: 'Market Watch', icon: BarChart3 },
  { path: '/configuration', label: 'Configuration', icon: Settings },
  { path: '/agent', label: 'Agent', icon: Bot },
  { path: '/execution', label: 'Execution', icon: Zap },
  { path: '/self-improvement', label: 'Self-Improvement', icon: TrendingUp },
];

export default function SideNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="flex w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/market-watch');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
