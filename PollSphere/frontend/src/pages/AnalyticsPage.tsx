import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPollAnalytics } from '../api/analytics.api';
import { updatePollStatus } from '../api/poll.api';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { socket } from '../socket/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users, Rocket, AlertCircle, Share2, Activity, TrendingUp, MousePointer2, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'sonner';

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

  const handlePublish = async () => {
    try {
      await updatePollStatus(pollId!, 'published');
      toast.success("Poll results are now public!");
      fetchAnalytics();
    } catch (e) {
      toast.error('Failed to publish poll');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={poll.status === 'published' ? 'success' : 'secondary'} className="uppercase border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
              {poll.status}
            </Badge>
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Analytics Dashboard</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{poll.title}</h1>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            {poll.status !== 'published' && (
              <Button onClick={handlePublish} size="lg" className="rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
                <Rocket size={18} />
                Publish Results
              </Button>
            )}
            <Link to={`/poll/${poll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${poll._id}` as any}>
              <Button variant="outline" size="lg" className="rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center gap-2">
                <Share2 size={18} />
                View Poll
              </Button>
            </Link>
          </div>
          <Link 
            to={`/poll/${poll.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${poll._id}` as any}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 mt-1 mr-2"
          >
            Vote you if you want <MousePointer2 size={10} />
          </Link>
        </motion.div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-2 border-foreground bg-primary/5 p-6 flex items-center gap-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-4 bg-primary text-primary-foreground rounded-xl border-2 border-foreground">
              <Users size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Global Reach</p>
              <p className="text-4xl font-black">{analytics.totalResponses}</p>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-foreground bg-success/5 p-6 flex items-center gap-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
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
        </motion.div>
      </div>

      {/* Animated Summary Overview */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <Card className="border-2 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden mb-16">
          <CardHeader className="bg-foreground text-background p-6">
            <CardTitle className="flex items-center gap-3 text-xl"><TrendingUp /> Response Summary Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                {analytics.questions.map((q: any, idx: number) => {
                  const maxOption = q.options.reduce((p: any, c: any) => (parseFloat(p.percentage) > parseFloat(c.percentage)) ? p : c, q.options[0]);
                  return (
                    <div key={q.questionId} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                        <span>Q{idx+1}: {q.text}</span>
                        <span>{maxOption.percentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${maxOption.percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full" 
                          style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border-2 border-foreground bg-primary/5 text-center">
                    <Trophy size={20} className="text-primary mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-muted-foreground">Crowd Fav</p>
                    <p className="text-xs font-black truncate">{analytics.mostVotedOption?.text || "N/A"}</p>
                  </div>
                  <div className="p-5 rounded-2xl border-2 border-foreground bg-accent/5 text-center">
                    <Clock size={20} className="text-accent mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-muted-foreground">Last Update</p>
                    <p className="text-xs font-black">Just now</p>
                  </div>
                </div>
                <div className="flex-1 p-5 rounded-2xl border-2 border-foreground bg-muted/30 flex flex-col min-h-[140px]">
                   <span className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Real-time Vote Flux</span>
                   <div className="flex-1 flex items-end gap-1.5">
                      {analytics.timeline?.map((t: any, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max((t.count / analytics.totalResponses) * 100, 10)}%` }}
                          className="flex-1 bg-primary/40 rounded-t-md hover:bg-primary transition-colors"
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Breakdown with Pie Charts */}
      <div className="space-y-16">
        <div className="flex items-center gap-4">
           <div className="h-[2px] flex-1 bg-foreground/10" />
           <span className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Detailed Breakdown</span>
           <div className="h-[2px] flex-1 bg-foreground/10" />
        </div>
        
        {analytics.questions.map((q: any, idx: number) => (
          <motion.div
            key={q.questionId}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b-2 border-foreground p-8">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl sm:text-3xl font-black">
                    <span className="text-primary mr-3 italic">Q{idx + 1}.</span> {q.text}
                  </CardTitle>
                  <div className="text-right shrink-0 ml-4">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Question Total</p>
                     <p className="text-3xl font-black text-foreground">{q.totalVotes}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                  {/* Left: Animated Line Bars */}
                  <div className="lg:col-span-3 space-y-8">
                    {q.options.map((opt: any, optIdx: number) => {
                      const color = chartColors[optIdx % chartColors.length];
                      return (
                        <div key={opt.optionId} className="group space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{opt.text}</span>
                            <div className="text-right">
                              <span className="text-2xl font-black" style={{ color }}>{opt.percentage}%</span>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{opt.voteCount} Votes</p>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-6 border-2 border-foreground/10 overflow-hidden relative shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${opt.percentage}%` }}
                              transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                              viewport={{ once: true }}
                              className="h-full relative" 
                              style={{ backgroundColor: color }}
                            >
                               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Pie Chart Visualization */}
                  <div className="lg:col-span-2 h-[300px] flex items-center justify-center bg-muted/20 rounded-3xl border-2 border-dashed border-border p-4 relative group">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={q.options}
                          dataKey="voteCount"
                          nameKey="text"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                        >
                          {q.options.map((_: any, oIdx: number) => (
                            <Cell key={`cell-${oIdx}`} fill={chartColors[oIdx % chartColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: '2px solid black', 
                            fontWeight: '900',
                            fontSize: '12px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute pointer-events-none flex flex-col items-center justify-center">
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Shares</span>
                       <span className="text-xl font-black text-foreground">Q{idx+1}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
