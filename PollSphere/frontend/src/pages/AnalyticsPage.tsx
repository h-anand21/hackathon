import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { getPollAnalytics } from '../api/analytics.api';
import { updatePollStatus } from '../api/poll.api';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/Button';
import { socket } from '../socket/socket';

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

    // WebSockets Real-Time Magic!
    if (pollId) {
      socket.connect();
      socket.emit('join_poll_room', pollId);

      // Listen for the backend pushing new vote data instantly
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

  if (!isLoaded || !userId) return <div className="p-8 text-center text-gray-500">Please log in to view analytics.</div>;
  if (loading) return <div className="p-10 text-center text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold text-xl">{error}</div>;

  const handlePublish = async () => {
    try {
      await updatePollStatus(pollId!, 'published');
      alert('Poll published successfully! Public users can now see the results.');
      fetchAnalytics(); // Refresh to update status pill
    } catch (e) {
      alert('Failed to publish poll');
    }
  };

  const poll = data.poll;
  const analytics = data.analytics;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics: {poll.title}</h1>
          <p className="text-gray-600">Total Responses: <span className="font-bold text-blue-600 text-lg">{analytics.totalResponses}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${poll.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            Status: {poll.status.toUpperCase()}
          </span>
          {poll.status !== 'published' && (
            <Button onClick={handlePublish} className="bg-purple-600 hover:bg-purple-700">Publish Results</Button>
          )}
        </div>
      </div>

      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        {analytics.questions.map((q: any, idx: number) => (
          <div key={q.questionId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{idx + 1}. {q.text}</h3>
            <p className="text-sm text-gray-500 mb-6">Total votes for this question: {q.totalVotes}</p>
            
            <div className="space-y-6">
              {q.options.map((opt: any) => (
                <div key={opt.optionId}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-700">{opt.text}</span>
                    <span className="text-gray-900">{opt.voteCount} votes ({opt.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${opt.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
