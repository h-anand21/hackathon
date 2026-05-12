import React, { useState } from 'react';
import { CreatePollForm } from '../forms/CreatePollForm';
import { QuestionForm } from '../forms/QuestionForm';
import { createPoll, addQuestionToPoll, updatePollStatus } from '../api/poll.api';
import { POLLING_TYPES } from '../types/poll.types';
import type { Poll, Question } from '../types/poll.types';

if (POLLING_TYPES) { /* Types loaded */ }
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ListChecks, ArrowRight } from 'lucide-react';

export const CreatePollPage: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const navigate = useNavigate();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPollLoading, setIsPollLoading] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);

  // Quick protection check
  if (!isLoaded || !userId) return <div className="p-20 text-center text-muted-foreground font-bold">Please log in to create polls.</div>;

  const handleCreatePoll = async (data: any) => {
    setIsPollLoading(true);
    try {
      const formattedData = {
        ...data,
        expiresAt: new Date(data.expiresAt).toISOString()
      };
      const res = await createPoll(formattedData);
      if (res.success) {
        setActivePoll(res.poll);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create poll. Check console.");
    } finally {
      setIsPollLoading(false);
    }
  };

  const handleAddQuestion = async (data: any) => {
    if (!activePoll) return;
    setIsQuestionLoading(true);
    try {
      const res = await addQuestionToPoll(activePoll._id, data);
      if (res.success) {
        const questionWithOptions = {
          ...res.question,
          options: res.options || []
        };
        setQuestions([...questions, questionWithOptions]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add question. Check console.");
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!activePoll) return;
    try {
      await updatePollStatus(activePoll._id, 'active');
      navigate({ to: `/analytics/${activePoll._id}` });
    } catch(e) {
      console.error(e);
      alert("Failed to activate poll");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Create a New Poll</h1>
        <p className="text-muted-foreground text-lg">Set up your poll and add interactive questions.</p>
      </div>
      
      {!activePoll ? (
        <CreatePollForm onSubmit={handleCreatePoll} isLoading={isPollLoading} />
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-primary bg-primary/5 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(var(--primary-rgb),0.1)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-1">{activePoll.title}</h2>
                  {activePoll.description && <p className="text-muted-foreground mb-4">{activePoll.description}</p>}
                  <Badge variant="success" className="font-bold border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    Poll Container Created
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={20} className="text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-muted-foreground">Your Questions ({questions.length})</h3>
            </div>
            {questions.map((q, idx) => (
              <Card key={q._id || idx} className="border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-sm">
                      {idx + 1}
                    </div>
                    <p className="font-bold text-foreground text-lg">
                      {q.text} {q.isMandatory && <span className="text-destructive ml-1" title="Mandatory">*</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 pl-12">
                    {q.options?.map((opt: any, oIdx: number) => (
                      <Badge key={oIdx} variant="outline" className="border-2 border-foreground bg-muted font-bold">
                        {opt.value || opt.text}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <QuestionForm onSubmit={handleAddQuestion} isLoading={isQuestionLoading} />
          
          {questions.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-border flex justify-end">
               <Button 
                 onClick={handleFinish} 
                 variant="accent"
                 size="lg"
                 className="h-16 px-10 text-xl font-black border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
               >
                 Finish & Publish Poll
                 <ArrowRight size={24} />
               </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
