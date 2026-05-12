import React from 'react';
import { createRouter, createRoute, createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollPage } from './pages/PollPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublishedResultPage } from './pages/PublishedResultPage';
import { MyPollsPage } from './pages/MyPollsPage';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/Button';
import { Menu, X, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

const rootRoute = createRootRoute({
  component: () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <header className="sticky top-4 z-50 mx-4 mt-4 backdrop-blur-md bg-background/80 border border-border rounded-2xl shadow-sm transition-all duration-300">
          <nav className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            {/* Left: App logo */}
            <Link to="/" className="font-black text-2xl tracking-tighter text-primary">
              PollSphere
            </Link>

            {/* Center: Nav links (Desktop) */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                activeOptions={{ exact: true }}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-primary hover:text-primary" }}
              >
                Home
              </Link>
              <SignedIn>
                <Link 
                  to="/my-polls" 
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-primary hover:text-primary" }}
                >
                  My Polls
                </Link>
                <Link 
                  to="/create-poll" 
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-primary hover:text-primary" }}
                >
                  Create Poll
                </Link>
              </SignedIn>
            </div>

            {/* Right: Toggle + Auth */}
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "border-2 border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]",
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-bold">Log In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="font-black">Get Started</Button>
                </SignUpButton>
              </SignedOut>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Drawer */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300 bg-background/95 backdrop-blur-xl rounded-b-2xl">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold p-3 rounded-xl hover:bg-muted"
                activeProps={{ className: "bg-primary/10 text-primary" }}
              >
                Home
              </Link>
              <SignedIn>
                <Link 
                  to="/my-polls" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold p-3 rounded-xl hover:bg-muted"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  My Polls
                </Link>
                <Link 
                  to="/create-poll" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-bold p-3 rounded-xl hover:bg-muted"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  Create Poll
                </Link>
              </SignedIn>
            </div>
          )}
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="relative isolate pt-14 bg-dots bg-background">
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-border/80 transition-all bg-background/50 backdrop-blur-sm">
                ✨ <span className="font-bold text-primary">Live Polling Platform</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-foreground">
              Create Polls. <br />
              Collect Votes. <br />
              <span className="text-primary">Get Insights.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-10">
              Engage your audience in real-time with beautiful, secure, and fast polls. 
              Analyze results instantly with powerful visual analytics.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link to="/create-poll">
                <Button variant="accent" size="lg" className="h-16 px-10 text-xl font-black rounded-2xl shadow-2xl shadow-accent/20 flex items-center gap-2 border-2 border-foreground">
                  Create Your First Poll
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/my-polls">
                <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl">
                  View Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 text-left max-w-5xl mx-auto">
              {[
                { icon: Zap, title: "Real-time Magic", desc: "Watch votes pour in instantly with WebSockets." },
                { icon: Shield, title: "Secure & Fair", desc: "Advanced protection against duplicate voting." },
                { icon: BarChart3, title: "Deep Analytics", desc: "Visualize your data with beautiful bar charts." }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});

const createPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-poll',
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
