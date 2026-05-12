import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { getPublicPoll, submitVote } from '../api/response.api';
import { Button } from '../components/ui/Button';
import { useAuth, SignInButton } from '@clerk/clerk-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Label } from '../components/ui/Label';
import { AlertCircle, Clock, Vote, LogIn } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export const PollPage: React.FC = () => {
  const { shareId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  
  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    
    getPublicPoll(shareId)
      .then(res => {
        if (res.success) {
          if (res.poll.status === 'published' || res.poll.status === 'expired') {
            navigate({ to: `/published/${shareId}` });
            return;
          }
          setPoll(res.poll);
          setQuestions(res.questions);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || "Failed to load poll.";
        if (msg.includes("expired")) {
           navigate({ to: `/published/${shareId}` });
        } else {
           setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-bold">Loading poll information...</div>;
  
  if (error) return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <Card className="border-2 border-destructive p-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(var(--destructive-rgb),0.1)]">
        <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2 text-destructive">Poll Error</h2>
        <p className="text-muted-foreground mb-6 font-bold">{error}</p>
        <Button onClick={() => navigate({ to: '/' })} className="font-black">Go Back Home</Button>
      </Card>
    </div>
  );

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      optionId: answers[qId]
    }));

    try {
      const res = await submitVote(shareId!, formattedAnswers);
      if (res.success) {
        navigate({ to: `/published/${shareId}` });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Please answer all mandatory questions.");
    } finally {
      setSubmitting(false);
    }
  };

  if (poll.responseMode === 'authenticated' && isLoaded && !isSignedIn) {
     return (
       <div className="max-w-2xl mx-auto py-20 px-6">
         <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-10 text-center rounded-2xl">
           <LogIn size={48} className="text-primary mx-auto mb-4" />
           <h2 className="text-2xl font-black mb-2">Login Required</h2>
           <p className="text-muted-foreground mb-8 text-lg font-medium">The creator of this poll requires voters to be authenticated. Please log in to participate.</p>
           <SignInButton mode="modal">
             <Button size="lg" className="px-10 font-black">Sign In to Vote</Button>
           </SignInButton>
         </Card>
       </div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden mb-12">
        <CardHeader className="bg-primary/5 border-b-2 border-foreground p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <Badge variant="outline" className="border-2 border-foreground bg-background text-xs font-black uppercase tracking-widest px-3">
              LIVE POLL
            </Badge>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
              <Clock size={14} className="text-primary" />
              Expires: {new Date(poll.expiresAt).toLocaleString()}
            </div>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {poll.title}
          </CardTitle>
          {poll.description && <p className="text-muted-foreground mt-4 text-lg leading-relaxed font-medium">{poll.description}</p>}
        </CardHeader>
        
        <CardContent className="p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl border-2 border-destructive flex items-center gap-3 font-black text-sm mb-8 animate-in shake duration-500">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {questions.map((q, idx) => (
              <div key={q._id} className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm border-2 border-foreground">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-black leading-tight">
                    {q.text} {q.isMandatory && <span className="text-destructive ml-1">*</span>}
                  </h3>
                </div>
                
                <div className="pl-12">
                  <RadioGroup 
                    onValueChange={(val) => handleOptionChange(q._id, val)}
                    className="grid grid-cols-1 gap-3"
                  >
                    {q.options.map((opt: any) => (
                      <div key={opt._id} className="group">
                        <Label
                          htmlFor={opt._id}
                          className={cn(
                            "flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-background cursor-pointer hover:border-primary hover:bg-primary/5 transition-all shadow-sm",
                            answers[q._id] === opt._id && "border-primary bg-primary/5 shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]"
                          )}
                        >
                          <RadioGroupItem value={opt._id} id={opt._id} className="border-2 w-6 h-6" />
                          <span className="text-lg font-bold">{opt.text}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}

            <div className="pt-8 border-t-2 border-border">
              <Button 
                type="submit" 
                disabled={submitting} 
                variant="accent"
                className="w-full h-16 text-xl font-black border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Vote size={24} />
                    Cast My Vote Now
                  </>
                )}
              </Button>
              <p className="text-center text-muted-foreground text-[10px] font-black mt-6 uppercase tracking-[0.2em]">
                One vote per IP address • Secure encrypted submission
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
