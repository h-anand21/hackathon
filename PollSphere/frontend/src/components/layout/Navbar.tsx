import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ThemeToggle } from '../ThemeToggle';
import { BarChart3, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Landing page nav links (logged out)
  const landingLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Roadmap', href: '#roadmap' },
  ];

  // App nav links (logged in) — Home & My Polls only
  const appLinks = [
    { label: 'Home', to: '/' },
    { label: 'My Polls', to: '/my-polls' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b-2 border-foreground/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
            <BarChart3 size={22} />
          </div>
          <span className="text-xl font-black tracking-tight">PollSphere</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">

          {/* Logged OUT: Landing page anchor links */}
          <SignedOut>
            {landingLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
          </SignedOut>

          {/* Logged IN: App navigation links */}
          <SignedIn>
            {appLinks.map(link => (
              <Link
                key={link.label}
                to={link.to as any}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: 'text-primary font-black' }}
                activeOptions={link.to === '/' ? { exact: true } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </SignedIn>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {/* Logged OUT */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-black px-4 py-2 rounded-xl border-2 border-foreground bg-background hover:bg-muted transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                Sign In
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="text-sm font-black px-5 py-2 rounded-xl border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                Get Started →
              </button>
            </SignInButton>
          </SignedOut>

          {/* Logged IN */}
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: 'border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]',
                }
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-xl border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b-2 border-foreground/10 px-6 py-6 flex flex-col gap-3">

          {/* Logged OUT: Landing links */}
          <SignedOut>
            {landingLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <SignInButton mode="modal">
                <button className="flex-1 text-sm font-black py-2.5 rounded-xl border-2 border-foreground bg-primary text-primary-foreground">
                  Get Started →
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          {/* Logged IN: App links */}
          <SignedIn>
            {appLinks.map(link => (
              <Link
                key={link.label}
                to={link.to as any}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-black text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border"
                activeProps={{ className: 'text-primary font-black py-2 border-b border-border' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

        </div>
      )}
    </nav>
  );
};
