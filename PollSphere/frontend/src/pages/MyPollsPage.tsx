import React, { useEffect, useState } from 'react';
import { getMyPolls } from '../api/poll.api';
import { POLLING_TYPES } from '../types/poll.types';
import type { Poll } from '../types/poll.types';

if (POLLING_TYPES) { /* Types loaded */ }
import { useAuth } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';

export const MyPollsPage: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      getMyPolls()
        .then(res => {
          if (res.success) setPolls(res.polls);
        })
        .catch(err => setError("Failed to load your polls"))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (!isLoaded || !userId) return <div className="p-8 text-center text-gray-500">Please log in to see your polls.</div>;
  if (loading) return <div className="p-10 text-center text-gray-500">Loading your polls...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-900">My Polls</h1>
        <Link to="/create-poll" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          + Create New Poll
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

      {polls.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-500 text-lg mb-6">You haven't created any polls yet.</p>
          <Link to="/create-poll" className="text-blue-600 font-bold hover:underline">Start by creating your first poll &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map(poll => (
            <div key={poll._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    poll.status === 'published' ? 'bg-green-100 text-green-700' : 
                    poll.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {poll.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(poll.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{poll.title}</h3>
                {poll.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{poll.description}</p>}
              </div>
              
              <div className="mt-6 flex gap-3">
                <Link 
                  to={`/analytics/$pollId`} 
                  params={{ pollId: poll._id }}
                  className="flex-1 text-center py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition"
                >
                  View Stats
                </Link>
                {poll.status !== 'draft' && (
                   <Link 
                     to={`/poll/$shareId`} 
                     params={{ shareId: poll._id }}
                     className="flex-1 text-center py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                   >
                     Vote Link
                   </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
