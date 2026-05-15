import mongoose from 'mongoose';
import { Response } from '../models/response.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';

export const getPollAnalytics = async (pollId: string, timelineLimit: number = 10) => {
  // 1. Total Responses
  const totalResponses = await Response.countDocuments({ pollId });

  // 2. Count votes per option using Aggregation Pipeline
  const optionStats = await Response.aggregate([
    { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
    { $unwind: '$answers' },
    { 
      $group: {
        _id: '$answers.optionId',
        count: { $sum: 1 }
      }
    }
  ]);

  // Map option counts for easy O(1) lookup
  const statsMap: Record<string, number> = {};
  optionStats.forEach(stat => {
    statsMap[stat._id.toString()] = stat.count;
  });

  // 3. Get full poll structure to attach stats
  const questions = await Question.find({ pollId }).lean();
  const options = await Option.find({ questionId: { $in: questions.map(q => q._id) } }).lean();

  const formattedData = questions.map(q => {
    const qOptions = options.filter(o => o.questionId.toString() === q._id.toString());
    
    // Calculate total votes for this specific question to get percentages
    const totalVotesForQuestion = qOptions.reduce((sum, opt) => sum + (statsMap[opt._id.toString()] || 0), 0);

    return {
      questionId: q._id,
      text: q.text,
      totalVotes: totalVotesForQuestion,
      options: qOptions.map(opt => {
        const votes = statsMap[opt._id.toString()] || 0;
        return {
          optionId: opt._id,
          text: opt.text,
          voteCount: votes,
          percentage: totalVotesForQuestion > 0 ? ((votes / totalVotesForQuestion) * 100).toFixed(1) : "0.0"
        };
      })
    };
  });

  // 4. Voting Timeline (Last 24 hours trend)
  const timeline = await Response.aggregate([
    { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        timestamp: { $first: '$createdAt' }
      }
    },
    { $sort: { timestamp: -1 } },
    { $limit: timelineLimit }
  ]);

  // Reverse timeline to show in chronological order
  const orderedTimeline = timeline.reverse();

  // Find most voted option across all questions
  let mostVotedOption = { text: "N/A", count: 0 };
  formattedData.forEach(q => {
    q.options.forEach(opt => {
      if (opt.voteCount > mostVotedOption.count) {
        mostVotedOption = { text: opt.text, count: opt.voteCount };
      }
    });
  });

  return {
    totalResponses,
    questions: formattedData,
    timeline: orderedTimeline,
    mostVotedOption
  };
};
