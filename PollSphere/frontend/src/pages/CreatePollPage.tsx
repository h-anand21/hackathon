import React, { useState } from 'react';
import { CreatePollForm } from '../forms/CreatePollForm';
import { QuestionForm } from '../forms/QuestionForm';
import { createPoll, addQuestionToPoll } from '../api/poll.api';
import { Poll, Question } from '../types/poll.types';
import { useAuth } from '@clerk/clerk-react';

export const CreatePollPage: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPollLoading, setIsPollLoading] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);

  // Quick protection check
  if (!isLoaded || !userId) return <div className="p-8 text-center text-gray-500">Please log in to create polls.</div>;

  const handleCreatePoll = async (data: any) => {
    setIsPollLoading(true);
    try {
      const res = await createPoll(data);
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
        setQuestions([...questions, res.question]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add question. Check console.");
    } finally {
      setIsQuestionLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Create a New Poll</h1>
      
      {!activePoll ? (
        <CreatePollForm onSubmit={handleCreatePoll} isLoading={isPollLoading} />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900">{activePoll.title}</h2>
            {activePoll.description && <p className="text-blue-800 mt-2">{activePoll.description}</p>}
            <p className="text-sm text-blue-600 mt-4 bg-blue-100 py-2 px-3 rounded-md inline-block">
              Poll created successfully! Now, add your questions below.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <p className="font-medium text-gray-800 text-lg">
                  {idx + 1}. {q.text} {q.isMandatory && <span className="text-red-500 ml-1" title="Mandatory">*</span>}
                </p>
                <div className="mt-3 space-y-2 pl-4">
                   {/* We only render the text of the options here for preview */}
                   <p className="text-sm text-gray-500 italic">This question has {q.options?.length || 0} options attached.</p>
                </div>
              </div>
            ))}
          </div>

          <QuestionForm onSubmit={handleAddQuestion} isLoading={isQuestionLoading} />
          
          {questions.length > 0 && (
            <div className="mt-8 pt-6 border-t flex justify-end">
               <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg">
                 Finish & Publish Poll
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
