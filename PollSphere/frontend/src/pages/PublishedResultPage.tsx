import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPublicResults } from '../api/analytics.api';
import { socket } from '../socket/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, BarChart3, AlertCircle, TrendingUp, Trophy, Clock, Activity, MousePointer2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const PublishedResultPage: React.FC = () => {
  const { shareId } = useParams({ strict: false });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shareId) return;
    getPublicResults(shareId)
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(err => setError(err.response?.data?.error || "Results are not public or not found"))
      .finally(() => setLoading(false));

    // WebSockets Real-Time Magic for Public Viewers!
    socket.connect();
    socket.emit('join_poll_room', shareId);

    socket.on('poll_updated', (updatedAnalytics) => {
      setData((prev: any) => ({
        ...prev,
        analytics: updatedAnalytics
      }));
    });

    return () => {
      socket.emit('leave_poll_room', shareId);
      socket.off('poll_updated');
      socket.disconnect();
    };
  }, [shareId]);

  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-black text-xl">Loading Final Insights...</div>;
  
  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <Card className="border-2 border-destructive p-10 rounded-2xl">
        <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2 text-destructive">Results Unavailable</h2>
        <p className="text-muted-foreground mb-6 font-bold">{error}</p>
        <Link to="/"><Button variant="outline">Back to Home</Button></Link>
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
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge variant="success" className="mb-4 px-4 py-1.5 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] flex items-center gap-2 mx-auto w-fit">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Live Results
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground mb-4">
          Final Insights
        </h1>
        <h2 className="text-2xl font-bold text-primary italic">
          {poll.title}
        </h2>
        
        {/* Header Pills (Red Boxes) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <Users size={18} className="text-primary" />
            <span className="font-black text-xl">{analytics.totalResponses}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Votes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <BarChart3 size={18} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest">Visual Analytics</span>
          </div>
          {/* New Pill 1: Summary */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border-2 border-primary shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.1)]">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Summary</span>
          </div>
          {/* New Pill 2: Activity */}
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border-2 border-success shadow-[4px_4px_0px_0px_rgba(var(--success-rgb),0.1)]">
            <Activity size={18} className="text-success" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Trend</span>
          </div>
        </div>
      </div>

      {/* Live Analytics Summary Card */}
      <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden mb-12">
        <CardHeader className="bg-foreground text-background p-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <TrendingUp size={24} />
            Response Summary Overview
          </CardTitle>
          <p className="text-[10px] font-black text-background/70 uppercase tracking-widest mt-1">High-level insights across all questions</p>
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
                      <span className="truncate max-w-[180px]">Q{idx + 1}: {q.text}</span>
                      <span className="group-hover:text-foreground transition-colors font-black">Top: {maxOption.percentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/5 shadow-inner">
                      <div 
                        className="h-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${maxOption.percentage}%`, backgroundColor: barColor }}
                      >
                         <div className="absolute top-0 right-0 h-full w-4 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-3 py-2 rounded-xl font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl border-2 border-background whitespace-nowrap">
                      {maxOption.voteCount} Votes for "{maxOption.text}"
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics + Timeline (Right) */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl border-2 border-foreground bg-primary/5 flex flex-col items-center justify-center text-center">
                    <Trophy size={20} className="text-primary mb-2" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crowd Favorite</p>
                    <p className="text-[11px] font-black truncate w-full px-1">{analytics.mostVotedOption?.text || "N/A"}</p>
                 </div>
                 <div className="p-5 rounded-2xl border-2 border-foreground bg-accent/5 flex flex-col items-center justify-center text-center">
                    <Clock size={20} className="text-accent mb-2" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Activity</p>
                    <p className="text-xs font-black">Just Now</p>
                 </div>
              </div>

              {/* Voting Activity Timeline */}
              <div className="flex-1 p-5 rounded-2xl border-2 border-foreground bg-muted/30 flex flex-col min-h-[120px]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voting Activity</span>
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-1">
                  {analytics.timeline?.length > 0 ? (
                    analytics.timeline.map((t: any, i: number) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary/40 hover:bg-primary transition-all rounded-t-sm relative group/bar"
                        style={{ height: `${Math.max((t.count / analytics.totalResponses) * 100, 15)}%` }}
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 border-2 border-background">
                           {t.count} Votes at {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true, timeZone: 'Asia/Kolkata' })}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center text-muted-foreground italic text-[10px]">Trend pending...</div>
                  )}
                </div>
                <div className="mt-3 border-t border-border pt-2 flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  <span>Start</span>
                  <span>Interactive Trend</span>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="space-y-10">
        <div className="flex items-center gap-2 mb-6">
           <div className="h-[2px] flex-1 bg-border" />
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4">Detailed Question Breakdown</span>
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
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question Total</p>
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
                    {/* Tooltip on Hover */}
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
      
      <div className="mt-16 text-center bg-primary/5 p-12 rounded-3xl border-2 border-dashed border-primary/20">
        <p className="text-muted-foreground font-black text-xs mb-6 uppercase tracking-[0.3em]">Enjoyed these insights?</p>
        <Link to="/create-poll">
          <Button size="lg" className="rounded-2xl px-12 h-16 text-xl font-black border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Create Your Own Poll
          </Button>
        </Link>
      </div>
    </div>
  );
};
