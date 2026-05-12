import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPollAnalytics } from '../api/analytics.api';
import { updatePollStatus } from '../api/poll.api';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { socket } from '../socket/socket';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users, BarChart3, Rocket, AlertCircle, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const AnalyticsPage: React.FC = () => {
  const { pollId } = useParams({ strict: false });
  const { isLoaded, userId } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchAnalytics = () => {
    if (!pollId) return;
    getPollAnalytics(pollId)
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(err => setError(err.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();

    if (pollId) {
      socket.connect();
      socket.emit('join_poll_room', pollId);

      socket.on('poll_updated', (updatedAnalytics) => {
        setData((prev: any) => ({
          ...prev,
          analytics: updatedAnalytics
        }));
      });
    }

    return () => {
      if (pollId) {
        socket.emit('leave_poll_room', pollId);
        socket.off('poll_updated');
        socket.disconnect();
      }
    };
  }, [pollId]);

  if (!isLoaded || !userId) return <div className="p-20 text-center text-muted-foreground font-bold">Please log in to view analytics.</div>;
  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-bold">Gathering insights...</div>;
  
  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <Card className="border-2 border-destructive p-10 rounded-2xl">
        <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2 text-destructive">Analytics Error</h2>
        <p className="text-muted-foreground mb-6 font-bold">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    </div>
  );

  const poll = data.poll;
  const analytics = data.analytics;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={poll.status === 'published' ? 'success' : 'secondary'} className="uppercase border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
              {poll.status}
            </Badge>
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Analytics Dashboard</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{poll.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {poll.status !== 'published' && (
            <Button onClick={handlePublish} size="lg" className="rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
              <Rocket size={18} />
              Publish Results
            </Button>
          )}
          <Link to={`/poll/${poll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${poll._id}`}>
            <Button variant="outline" size="lg" className="rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center gap-2">
              <Share2 size={18} />
              View Poll
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <Card className="border-2 border-foreground bg-primary/5 p-6 flex items-center gap-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="p-4 bg-primary text-primary-foreground rounded-xl border-2 border-foreground">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Responses</p>
            <p className="text-4xl font-black">{analytics.totalResponses}</p>
          </div>
        </Card>
        <Card className="border-2 border-foreground bg-success/5 p-6 flex items-center gap-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="p-4 bg-success text-success-foreground rounded-xl border-2 border-foreground">
            <BarChart3 size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Live Status</p>
            <p className="text-xl font-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Monitoring
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-10">
        {analytics.questions.map((q: any, idx: number) => (
          <Card key={q.questionId} className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardHeader className="bg-primary/5 border-b-2 border-foreground p-6 sm:p-8">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl sm:text-2xl font-black">
                  <span className="text-primary mr-2">Q{idx + 1}.</span> {q.text}
                </CardTitle>
                <div className="text-right">
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Votes</p>
                   <p className="text-2xl font-black">{q.totalVotes}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-6">
              {q.options.map((opt: any, optIdx: number) => (
                <div key={opt.optionId} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-foreground text-lg">{opt.text}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">{opt.percentage}%</span>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{opt.voteCount} Votes</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 border border-border overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 ease-out",
                        optIdx % 2 === 0 ? "bg-primary" : "bg-teal-400"
                      )} 
                      style={{ width: `${opt.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  async function handlePublish() {
    try {
      await updatePollStatus(pollId!, 'published');
      fetchAnalytics();
    } catch (e) {
      alert('Failed to publish poll');
    }
  }
};
