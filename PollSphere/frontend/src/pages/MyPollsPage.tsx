import React, { useEffect, useState } from 'react';
import { getMyPolls, deletePoll } from '../api/poll.api';
import { POLLING_TYPES } from '../types/poll.types';
import type { Poll } from '../types/poll.types';

if (POLLING_TYPES) { /* Types loaded */ }
import { useAuth } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calendar, BarChart2, Check, Copy, ExternalLink, Plus, Trash2, Edit2 } from 'lucide-react';

import { toast } from 'sonner';

export const MyPollsPage: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPolls = () => {
    if (userId) {
      getMyPolls()
        .then(res => {
          if (res.success) setPolls(res.polls);
        })
        .catch(() => setError("Failed to load your polls"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [userId]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied to clipboard!", {
      description: "You can now share this poll with your audience.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the poll: "${title}"? This action cannot be undone.`)) return;

    try {
      const res = await deletePoll(id);
      if (res.success) {
        toast.success("Poll deleted successfully");
        setPolls(prev => prev.filter(p => p._id !== id));
      } else {
        toast.error("Failed to delete poll");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the poll");
    }
  };

  if (!isLoaded || !userId) return <div className="p-20 text-center text-muted-foreground font-bold">Please log in to see your polls.</div>;
  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-bold">Loading your polls...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">My Polls</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage and track your active polling campaigns.</p>
        </div>
        <Link to="/create-poll">
          <Button variant="accent" size="lg" className="rounded-2xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center gap-2">
            <Plus size={20} />
            Create New Poll
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 border-2 border-destructive flex items-center gap-3 font-bold">
          <ExternalLink size={20} />
          {error}
        </div>
      )}

      {polls.length === 0 ? (
        <Card className="border-2 border-dashed border-border bg-transparent p-20 text-center rounded-3xl">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-6 bg-muted rounded-full">
              <BarChart2 size={64} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-2xl font-bold">You haven't created any polls yet.</p>
            <Link to="/create-poll">
              <Button variant="accent" size="lg" className="rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Start by creating your first poll &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {polls.map(poll => {
            const slug = poll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'poll';
            const shareUrl = `${window.location.origin}/poll/${slug}/${poll._id}`;
            
            return (
              <Card key={poll._id} className="group hover:-translate-y-2 border-2 border-foreground rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-300 overflow-hidden relative">
                <CardHeader className="pb-4 bg-muted/50 border-b-2 border-foreground relative">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Badge 
                        variant={poll.status === 'published' ? 'success' : poll.status === 'active' ? 'accent' : 'secondary'} 
                        className="uppercase tracking-widest border border-foreground/20 text-[9px] h-7 px-2"
                      >
                        {poll.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-background/80 px-2 h-7 rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] whitespace-nowrap">
                        <Calendar size={10} className="text-primary" />
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {poll.status === 'draft' && (
                        <Link 
                          to="/create-poll" 
                          search={{ pollId: poll._id }}
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all rounded-xl border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.05)]"
                            title="Continue Editing Draft"
                          >
                            <Edit2 size={18} />
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(poll._id, poll.title)}
                        className="h-9 w-9 text-rose-700 bg-rose-100 hover:bg-rose-200 transition-all rounded-xl border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.05)]"
                        title="Delete Poll"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors line-clamp-1">{poll.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="py-6 min-h-[6rem]">
                  {poll.description && <p className="text-muted-foreground text-sm font-medium line-clamp-3 leading-relaxed">{poll.description}</p>}
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                  <div className="flex w-full gap-3">
                    <Link 
                      to={`/analytics/${poll._id}` as any} 
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full font-black border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none transition-all">
                        Stats
                      </Button>
                    </Link>
                    {poll.status !== 'draft' ? (
                      <Link 
                        to={(poll.status === 'published' ? `/published/${poll._id}` : `/poll/${slug}/${poll._id}`) as any} 
                        className="flex-1"
                      >
                        <Button className="w-full font-black border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none transition-all">
                          {poll.status === 'published' ? 'Final Results' : 'Vote Now'}
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="flex-1 font-black opacity-50 border-2 border-foreground bg-muted text-muted-foreground">
                        Result Pending
                      </Button>
                    )}
                  </div>
                  
                  {poll.status !== 'draft' && (
                    <div className="flex w-full items-center group/copy mt-2">
                      <div className="relative flex-1">
                         <input 
                          type="text" 
                          readOnly 
                          value={shareUrl} 
                          className="w-full text-[10px] font-mono py-2.5 px-3 border-2 border-foreground bg-muted/30 text-muted-foreground rounded-l-xl outline-none transition-colors border-r-0"
                          onClick={(e) => e.currentTarget.select()}
                        />
                      </div>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(shareUrl, poll._id)}
                        className="rounded-l-none rounded-r-xl px-4 h-[39px] border-2 border-foreground"
                      >
                        {copiedId === poll._id ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
