import { Outlet } from '@tanstack/react-router';
import SideNav from './SideNav';
import { Activity } from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <SideNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ICP Quant Agent</h1>
              <p className="text-sm text-muted-foreground">DEX Arbitrage Intelligence Platform</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
