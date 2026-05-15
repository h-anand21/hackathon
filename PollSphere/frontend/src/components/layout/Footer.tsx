import React from 'react';
import { Link } from '@tanstack/react-router';
import { BarChart3, Code2, Send, Link2, Mail, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-xl border-2 border-background/30">
                <BarChart3 size={22} className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tight text-background">PollSphere</span>
            </div>
            <p className="text-background/60 font-medium leading-relaxed max-w-sm mb-6">
              The most powerful real-time polling platform for teams, events, and communities. Create, share, and analyze polls in seconds.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/h-anand21/hackathon" target="_blank" rel="noreferrer" className="p-2.5 bg-background/10 hover:bg-background/20 rounded-xl border border-background/20 transition-all hover:scale-110">
                <Code2 size={18} className="text-background" />
              </a>
              <a href="#" className="p-2.5 bg-background/10 hover:bg-background/20 rounded-xl border border-background/20 transition-all hover:scale-110">
                <Send size={18} className="text-background" />
              </a>
              <a href="#" className="p-2.5 bg-background/10 hover:bg-background/20 rounded-xl border border-background/20 transition-all hover:scale-110">
                <Link2 size={18} className="text-background" />
              </a>
              <a href="mailto:hello@pollsphere.app" className="p-2.5 bg-background/10 hover:bg-background/20 rounded-xl border border-background/20 transition-all hover:scale-110">
                <Mail size={18} className="text-background" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-background/50 text-xs mb-4">Product</h4>
            <ul className="space-y-3">
              {['Features', 'How It Works', 'Roadmap', 'FAQ'].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-background/70 hover:text-background font-bold transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-background/50 text-xs mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/create-poll" className="text-background/70 hover:text-background font-bold transition-colors text-sm">
                  Create a Poll
                </Link>
              </li>
              <li>
                <Link to="/my-polls" className="text-background/70 hover:text-background font-bold transition-colors text-sm">
                  My Polls
                </Link>
              </li>
              <li>
                <a href="https://github.com/h-anand21/hackathon" target="_blank" rel="noreferrer" className="text-background/70 hover:text-background font-bold transition-colors text-sm">
                  GitHub Repo
                </a>
              </li>
              <li>
                <a href="mailto:hello@pollsphere.app" className="text-background/70 hover:text-background font-bold transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/40 text-sm font-bold">
            © 2025 PollSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-background/40 text-sm font-bold">
            <Zap size={14} className="text-amber-400" />
            Built with passion for the Hackathon 2025
          </div>
        </div>
      </div>
    </footer>
  );
};
