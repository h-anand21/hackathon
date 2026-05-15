import React from 'react';
import { Link } from '@tanstack/react-router';
import { BarChart3, Code2, Send, Link2, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/30 border-t-2 border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary text-primary-foreground rounded-xl border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                <BarChart3 size={22} />
              </div>
              <span className="text-2xl font-black tracking-tight">PollSphere</span>
            </div>
            <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mb-6">
              The most powerful real-time polling platform for teams, events, and communities. Create, share, and analyze polls in seconds.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://github.com/h-anand21/hackathon', icon: Code2 },
                { href: '#', icon: Send },
                { href: '#', icon: Link2 },
                { href: 'mailto:hello@pollsphere.app', icon: Mail },
              ].map(({ href, icon: Icon }, i) => (
                <a key={i} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="p-2.5 bg-background border-2 border-foreground rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <Icon size={16} className="text-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-muted-foreground text-xs mb-5">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Roadmap', href: '#roadmap' },
                { label: 'FAQ', href: '#faq' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-muted-foreground text-xs mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/create-poll" className="font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create a Poll
                </Link>
              </li>
              <li>
                <Link to="/my-polls" className="font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Polls
                </Link>
              </li>
              <li>
                <a href="https://github.com/h-anand21/hackathon" target="_blank" rel="noreferrer"
                  className="font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href="mailto:hello@pollsphere.app"
                  className="font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-foreground/10 pt-8 flex justify-center items-center">
          <p className="text-muted-foreground text-sm font-bold">
            © 2026 PollSphere. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};
