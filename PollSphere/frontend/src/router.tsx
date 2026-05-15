import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollPage } from './pages/PollPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublishedResultPage } from './pages/PublishedResultPage';
import { MyPollsPage } from './pages/MyPollsPage';
import { HomePage } from './pages/HomePage';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const createPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-poll',
  validateSearch: (search: Record<string, unknown>): { pollId?: string } => {
    return {
      pollId: (search.pollId as string) || undefined,
    };
  },
  component: CreatePollPage,
});

const pollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poll/$slug/$shareId',
  component: PollPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics/$pollId',
  component: AnalyticsPage,
});

const publishedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/published/$shareId',
  component: PublishedResultPage,
});

const myPollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-polls',
  component: MyPollsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createPollRoute,
  pollRoute,
  analyticsRoute,
  publishedRoute,
  myPollsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
