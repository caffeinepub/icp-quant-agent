import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import AppLayout from './components/AppLayout';
import MarketWatchPage from './pages/MarketWatchPage';
import ConfigurationPage from './pages/ConfigurationPage';
import AgentPage from './pages/AgentPage';
import ExecutionPage from './pages/ExecutionPage';
import SelfImprovementPage from './pages/SelfImprovementPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MarketWatchPage,
});

const marketWatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/market-watch',
  component: MarketWatchPage,
});

const configurationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/configuration',
  component: ConfigurationPage,
});

const agentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent',
  component: AgentPage,
});

const executionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/execution',
  component: ExecutionPage,
});

const selfImprovementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/self-improvement',
  component: SelfImprovementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  marketWatchRoute,
  configurationRoute,
  agentRoute,
  executionRoute,
  selfImprovementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
