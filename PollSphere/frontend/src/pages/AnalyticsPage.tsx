import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPollAnalytics } from '../api/analytics.api';
import { updatePollStatus } from '../api/poll.api';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { socket } from '../socket/socket';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users, BarChart3, Rocket, AlertCircle, Share2, Activity, TrendingUp, MousePointer2, Trophy, Clock } from 'lucide-react';
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

  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

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
        <div className="flex flex-col items-end gap-2">
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
          <Link 
            to={`/poll/${poll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${poll._id}`}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 mt-1 mr-2"
          >
            Vote you if you want <MousePointer2 size={10} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <Card className="border-2 border-foreground bg-primary/5 p-6 flex items-center gap-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="p-4 bg-primary text-primary-foreground rounded-xl border-2 border-foreground">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Global Reach</p>
            <p className="text-4xl font-black">{analytics.totalResponses}</p>
          </div>
        </Card>
        <Card className="border-2 border-foreground bg-success/5 p-6 flex items-center gap-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="p-4 bg-success text-success-foreground rounded-xl border-2 border-foreground">
            <Activity size={32} />
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

      {/* Live Analytics Summary Overview */}
      <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <CardHeader className="bg-foreground text-background p-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <TrendingUp size={24} />
            Live Response Summary
          </CardTitle>
          <p className="text-xs font-bold text-background/70 uppercase tracking-widest mt-1">Comparative overview across all questions</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Visual Bar Chart Summary (Left) */}
            <div className="space-y-6">
              {analytics.questions.map((q: any, idx: number) => {
                const maxOption = q.options.reduce((prev: any, current: any) => (parseFloat(prev.percentage) > parseFloat(current.percentage)) ? prev : current, q.options[0]);
                const barColor = chartColors[idx % chartColors.length];
                return (
                  <div key={q.questionId} className="group relative space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                      <span className="truncate max-w-[200px]">Q{idx + 1}: {q.text}</span>
                      <span className="group-hover:text-foreground transition-colors">Top: {maxOption.percentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/5 shadow-inner">
                      <div 
                        className="h-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${maxOption.percentage}%`, backgroundColor: barColor }}
                      >
                         <div className="absolute top-0 right-0 h-full w-4 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-3 py-2 rounded-xl font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl border-2 border-background">
                      {maxOption.voteCount} Votes for "{maxOption.text}"
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Red Box Replacement: Interactive Metrics + Timeline (Right) */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl border-2 border-foreground bg-primary/5 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <Users size={20} className="text-primary mb-2" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Respondents</p>
                    <p className="text-3xl font-black">{analytics.totalResponses}</p>
                 </div>
                 <div className="p-5 rounded-2xl border-2 border-foreground bg-accent/5 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <Trophy size={20} className="text-accent mb-2" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crowd Favorite</p>
                    <p className="text-sm font-black truncate w-full px-2" title={analytics.mostVotedOption?.text}>{analytics.mostVotedOption?.text || "N/A"}</p>
                 </div>
              </div>

              {/* Voting Activity Timeline (Real-time trend) */}
              <div className="flex-1 p-5 rounded-2xl border-2 border-foreground bg-muted/30 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voting Activity Trend</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-foreground/20">LIVE</Badge>
                </div>
                
                <div className="flex-1 flex items-end gap-1 min-h-[80px]">
                  {analytics.timeline?.length > 0 ? (
                    analytics.timeline.map((t: any, i: number) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary/40 hover:bg-primary transition-all rounded-t-sm relative group/bar"
                        style={{ height: `${Math.max((t.count / analytics.totalResponses) * 100, 10)}%` }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                           {t.count} Votes at {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true, timeZone: 'Asia/Kolkata' })}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center text-muted-foreground italic text-xs gap-2">
                      <Activity size={24} className="animate-pulse opacity-20" />
                      Waiting for activity...
                    </div>
                  )}
                </div>
                <div className="mt-2 border-t border-border pt-2 flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  <span>Start</span>
                  <span>Timeline (Last 10 Events)</span>
                  <span>Now</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-10">
        <div className="flex items-center gap-2 mb-6">
           <div className="h-[2px] flex-1 bg-border" />
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4">Detailed Breakdown</span>
           <div className="h-[2px] flex-1 bg-border" />
        </div>
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
              {q.options.map((opt: any, optIdx: number) => {
                const optionColor = chartColors[optIdx % chartColors.length];
                return (
                  <div key={opt.optionId} className="group relative space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{opt.text}</span>
                      <div className="text-right">
                        <span className="text-2xl font-black" style={{ color: optionColor }}>{opt.percentage}%</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{opt.voteCount} Votes</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-5 border-2 border-foreground/5 overflow-hidden shadow-inner cursor-help">
                      <div 
                        className="h-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${opt.percentage}%`, backgroundColor: optionColor }}
                      >
                         <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {/* Detailed Tooltip on Hover */}
                    <div className="absolute -top-10 right-0 bg-foreground text-background text-[10px] px-3 py-1.5 rounded-lg font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 shadow-lg border-2 border-background">
                      {opt.voteCount} / {q.totalVotes} total votes
                    </div>
                  </div>
                );
              })}
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
