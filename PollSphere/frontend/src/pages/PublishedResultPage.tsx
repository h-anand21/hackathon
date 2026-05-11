import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { getPublicResults } from '../api/analytics.api';
import { socket } from '../socket/socket';

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

  if (loading) return <div className="p-10 text-center text-gray-500">Loading public results...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold text-xl">{error}</div>;

  const poll = data.poll;
  const analytics = data.analytics;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Final Results</h1>
        <h2 className="text-2xl text-blue-600 font-bold">{poll.title}</h2>
        <p className="mt-4 text-gray-600 text-lg">Total Participants: <span className="font-bold">{analytics.totalResponses}</span></p>
      </div>

      <div className="space-y-8 animate-in fade-in duration-700">
        {analytics.questions.map((q: any, idx: number) => (
          <div key={q.questionId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">{idx + 1}. {q.text}</h3>
            
            <div className="space-y-4">
              {q.options.map((opt: any) => (
                <div key={opt.optionId}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700">{opt.text}</span>
                    <span className="text-gray-500">{opt.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-1000" 
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
