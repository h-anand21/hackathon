import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPublicResults } from '../api/analytics.api';
import { socket } from '../socket/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, BarChart3, AlertCircle, TrendingUp, Trophy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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

    socket.connect();
    socket.emit('join_poll_room', shareId);
    socket.on('poll_updated', (updatedAnalytics) => {
      setData((prev: any) => ({ ...prev, analytics: updatedAnalytics }));
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
    <div className="max-w-5xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Badge variant="success" className="mb-4 px-4 py-1.5 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 mx-auto w-fit">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Live Results
        </Badge>
        <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-foreground mb-4">
          Final Insights
        </h1>
        <h2 className="text-2xl font-bold text-primary italic">{poll.title}</h2>
        
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
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
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
                          whileInView={{ width: `${maxOption.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
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
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Top Option</p>
                    <p className="text-xs font-black truncate">{analytics.mostVotedOption?.text || "N/A"}</p>
                  </div>
                  <div className="p-5 rounded-2xl border-2 border-foreground bg-accent/5 text-center">
                    <Activity size={20} className="text-accent mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Engagement</p>
                    <p className="text-xs font-black">High</p>
                  </div>
                </div>
                {/* Global Activity Timeline */}
                <div className="flex-1 p-5 rounded-2xl border-2 border-foreground bg-muted/30 flex flex-col min-h-[140px]">
                   <span className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Global Vote Activity</span>
                   <div className="flex-1 flex items-end gap-1.5">
                      {analytics.timeline?.map((t: any, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${Math.max((t.count / analytics.totalResponses) * 100, 10)}%` }}
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

      {/* Detailed Breakdown with Pie Charts & Animations */}
      <div className="space-y-16">
        {analytics.questions.map((q: any, idx: number) => (
          <motion.div
            key={q.questionId}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
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
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Votes</p>
                     <p className="text-3xl font-black text-foreground">{q.totalVotes}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                  {/* Left: Animated Bar Charts (60% width on LG) */}
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

                  {/* Right: Pie Chart (40% width on LG) */}
                  <div className="lg:col-span-2 h-[300px] flex items-center justify-center bg-muted/20 rounded-3xl border-2 border-dashed border-border p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                          animationBegin={400}
                          animationDuration={1500}
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
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Distribution</span>
                       <span className="text-xl font-black text-foreground">Q{idx+1}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 text-center bg-primary/5 p-16 rounded-[40px] border-4 border-foreground shadow-[16px_16px_0px_0px_rgba(var(--primary-rgb),0.1)]">
        <h3 className="text-3xl font-black mb-4">Want to create a poll like this?</h3>
        <p className="text-muted-foreground font-bold mb-8 uppercase tracking-widest">Free, Fast, and Beautifully Animated.</p>
        <Link to="/create-poll">
          <Button size="lg" className="rounded-2xl px-16 h-20 text-2xl font-black border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
};
