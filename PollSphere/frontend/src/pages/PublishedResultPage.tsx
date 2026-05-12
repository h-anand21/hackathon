import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPublicResults } from '../api/analytics.api';
import { socket } from '../socket/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, BarChart3, AlertCircle } from 'lucide-react';
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

  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse">Fetching final results...</div>;
  
  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <Card className="border-2 border-destructive p-10 rounded-2xl">
        <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Results Unavailable</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/"><Button>Back to Home</Button></Link>
      </Card>
    </div>
  );

  const poll = data.poll;
  const analytics = data.analytics;

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
        <h2 className="text-2xl font-bold text-primary">
          {poll.title}
        </h2>
        
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border">
            <Users size={18} className="text-primary" />
            <span className="font-black text-xl">{analytics.totalResponses}</span>
            <span className="text-muted-foreground font-medium">Votes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border">
            <BarChart3 size={18} className="text-primary" />
            <span className="text-muted-foreground font-medium">Visual Analytics</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {analytics.questions.map((q: any, idx: number) => (
          <Card key={q.questionId} className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardHeader className="bg-primary/5 border-b-2 border-foreground p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl font-black">
                <span className="text-primary mr-2">Q{idx + 1}.</span> {q.text}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-6">
              {q.options.map((opt: any, optIdx: number) => (
                <div key={opt.optionId} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-foreground">{opt.text}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">{opt.percentage}%</span>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{opt.count || opt.voteCount} Votes</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 border border-border overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 ease-out",
                        optIdx % 2 === 0 ? "bg-primary" : "bg-emerald-500"
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
      
      <div className="mt-16 text-center">
        <p className="text-muted-foreground font-bold text-sm mb-6 uppercase tracking-[0.2em]">Ready to create your own poll?</p>
        <Link to="/create-poll">
          <Button size="lg" className="rounded-2xl px-10 h-14 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            Get Started for Free
          </Button>
        </Link>
      </div>
    </div>
  );
};
