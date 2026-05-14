import React, { useState } from 'react';
import { CreatePollForm } from '../forms/CreatePollForm';
import { QuestionForm } from '../forms/QuestionForm';
import { createPoll, addQuestionToPoll, updatePollStatus, deleteQuestion } from '../api/poll.api';
import { POLLING_TYPES } from '../types/poll.types';
import type { Poll, Question } from '../types/poll.types';

if (POLLING_TYPES) { /* Types loaded */ }
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ListChecks, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPollById } from '../api/poll.api';

export const CreatePollPage: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/create-poll' }) as any;
  const pollId = search?.pollId;

  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPollLoading, setIsPollLoading] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Resume Draft Editing logic
  React.useEffect(() => {
    if (pollId && userId && !activePoll) {
      setIsPollLoading(true);
      getPollById(pollId)
        .then(res => {
          if (res.success) {
            setActivePoll(res.poll);
            setQuestions(res.questions);
            toast.info(`Resuming draft: ${res.poll.title}`);
          }
        })
        .catch(() => toast.error("Failed to load draft poll"))
        .finally(() => setIsPollLoading(false));
    }
  }, [pollId, userId, activePoll]);

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
        toast.success("Poll container created! Now add your questions.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create poll.");
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
        toast.success("Question added!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add question.");
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      const res = await deleteQuestion(qId);
      if (res.success) {
        setQuestions(prev => prev.filter(q => q._id !== qId));
        toast.success("Question deleted");
      }
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const handleEditQuestion = async (q: Question) => {
    // Basic edit: Delete the old one and re-populate the form
    if (window.confirm("Editing will remove this question from the list and let you re-create it. Continue?")) {
      await handleDeleteQuestion(q._id!);
      setEditingQuestion({
        text: q.text,
        isMandatory: q.isMandatory,
        options: q.options?.map((opt: any) => opt.text || opt.value) || []
      });
      // Scroll to form
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    if (!activePoll) return;
    try {
      await updatePollStatus(activePoll._id, 'active');
      toast.success("Poll published successfully!");
      navigate({ to: `/analytics/${activePoll._id}` });
    } catch(e) {
      console.error(e);
      toast.error("Failed to activate poll");
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
              <Card key={q._id || idx} className="border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative">
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditQuestion(q)}
                    className="h-10 w-10 rounded-xl border-2 border-foreground bg-amber-100 hover:bg-amber-400 text-amber-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    title="Edit Question"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteQuestion(q._id!)}
                    className="h-10 w-10 rounded-xl border-2 border-foreground bg-rose-100 hover:bg-rose-500 text-rose-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    title="Delete Question"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <p className="font-bold text-foreground text-lg pr-16">
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

          <QuestionForm 
            onSubmit={handleAddQuestion} 
            isLoading={isQuestionLoading} 
            initialData={editingQuestion} 
          />
          
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
