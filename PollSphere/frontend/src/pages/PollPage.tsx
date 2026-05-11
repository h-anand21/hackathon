import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { getPublicPoll, submitVote } from '../api/response.api';
import { Button } from '../components/ui/Button';
import { useAuth } from '@clerk/clerk-react';

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
          setPoll(res.poll);
          setQuestions(res.questions);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.error || "Failed to load poll.";
        if (msg.includes("expired")) {
           // We will handle expired UI directly
           setError("This poll has expired.");
        } else {
           setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading poll...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold text-xl">{error}</div>;

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
        alert("Vote submitted successfully!");
        navigate({ to: `/published/${shareId}` });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit vote. Check mandatory questions.");
    } finally {
      setSubmitting(false);
    }
  };

  if (poll.responseMode === 'authenticated' && isLoaded && !isSignedIn) {
     return (
       <div className="max-w-2xl mx-auto py-12 px-6 text-center">
         <h1 className="text-2xl font-bold mb-4">Login Required</h1>
         <p className="text-gray-600 mb-6">The creator of this poll requires voters to be authenticated. Please log in to participate.</p>
       </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{poll.title}</h1>
        {poll.description && <p className="text-gray-600 mb-6">{poll.description}</p>}
        
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-8">
          Expires: {new Date(poll.expiresAt).toLocaleString()}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q._id} className="p-5 border border-gray-100 rounded-xl bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {idx + 1}. {q.text} {q.isMandatory && <span className="text-red-500">*</span>}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((opt: any) => (
                  <label key={opt._id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer bg-white hover:border-blue-300 transition-colors">
                    <input 
                      type="radio" 
                      name={`question-${q._id}`} 
                      value={opt._id}
                      onChange={() => handleOptionChange(q._id, opt._id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button type="submit" disabled={submitting} className="w-full py-4 text-lg">
            {submitting ? 'Submitting Vote...' : 'Submit My Vote'}
          </Button>
        </form>
      </div>
    </div>
  );
};
