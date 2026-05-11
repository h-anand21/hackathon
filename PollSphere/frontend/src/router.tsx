import React from 'react';
import { createRouter, createRoute, createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollPage } from './pages/PollPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublishedResultPage } from './pages/PublishedResultPage';
import { MyPollsPage } from './pages/MyPollsPage';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="font-extrabold text-2xl text-blue-600 tracking-tighter cursor-pointer" onClick={() => window.location.href = '/'}>PollSphere</div>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-gray-700 font-semibold hover:text-blue-600 transition">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Get Started</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/my-polls" className="text-gray-700 font-semibold hover:text-blue-600 transition mr-4">My Polls</Link>
            <Link to="/create-poll" className="text-gray-700 font-semibold hover:text-blue-600 transition mr-4">Create Poll</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});

const createPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-poll',
  component: CreatePollPage,
});

const myPollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-polls',
  component: MyPollsPage,
});

const viewPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poll/$shareId',
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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="p-8 max-w-3xl mx-auto mt-10 text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Welcome to PollSphere</h1>
      <p className="text-gray-600 mb-8 text-lg">Create engaging polls and get real-time feedback.</p>
      <Link to="/create-poll" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
        Create Your First Poll
      </Link>
    </div>
  )
});

const routeTree = rootRoute.addChildren([
  indexRoute, 
  createPollRoute, 
  myPollsRoute,
  viewPollRoute, 
  analyticsRoute, 
  publishedRoute
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
