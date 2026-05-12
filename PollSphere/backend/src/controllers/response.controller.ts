import { Request, Response as ExpressResponse } from 'express';
import { Poll } from '../models/poll.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { Response } from '../models/response.model';

export const getPublicPoll = async (
  req: Request,
  res: ExpressResponse,
): Promise<void> => {
  try {
    const { shareId } = req.params;

    const poll = await Poll.findById(shareId);
    if (!poll) {
      res.status(404).json({ success: false, error: 'Poll not found' });
      return;
    }

    if (poll.status === 'draft') {
      res.status(403).json({ success: false, error: 'Poll is not active yet' });
      return;
    }

    const questions = await Question.find({ pollId: poll._id }).lean();
    const options = await Option.find({
      questionId: { $in: questions.map((q) => q._id) },
    }).lean();

    const formattedQuestions = questions.map((q) => ({
      ...q,
      options: options.filter(
        (o) => o.questionId.toString() === q._id.toString(),
      ),
    }));

    res
      .status(200)
      .json({ success: true, poll, questions: formattedQuestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitResponse = async (
  req: Request,
  res: ExpressResponse,
): Promise<void> => {
  try {
    const { shareId } = req.params;
    const { answers } = req.body;

    const poll = await Poll.findById(shareId);
    if (!poll) {
      res.status(404).json({ success: false, error: 'Poll not found' });
      return;
    }

    // 1. STRICT EXPIRY CHECK
    if (new Date() > new Date(poll.expiresAt)) {
      if (poll.status !== 'expired') {
        poll.status = 'expired';
        await poll.save();
      }
      res
        .status(403)
        .json({
          success: false,
          error: 'Poll has expired and is no longer accepting votes.',
        });
      return;
    }

    // 2. AUTHENTICATION MODE CHECK
    let voterId = req.auth?.userId; // Made available by loose Clerk auth
    if (poll.responseMode === 'authenticated' && !voterId) {
      res
        .status(401)
        .json({
          success: false,
          error: 'You must be logged in to vote on this poll.',
        });
      return;
    }

    // 3. DUPLICATE CHECK (1 Vote Per Person)
    if (voterId) {
      const existing = await Response.findOne({ pollId: poll._id, voterId });
      if (existing) {
        res
          .status(409)
          .json({
            success: false,
            error: 'You have already voted on this poll.',
          });
        return;
      }
    } else {
      // We enabled 'trust proxy' in app.ts, so req.ip securely contains the REAL user IP.
      const realIp = req.ip || 'unknown';
      
      const existing = await Response.findOne({
        pollId: poll._id,
        ipAddress: realIp,
      });
      
      if (existing) {
        res
          .status(409)
          .json({
            success: false,
            error: 'Your IP has already voted on this anonymous poll.',
          });
        return;
      }
    }

    // 4. MANDATORY QUESTIONS CHECK
    const questions = await Question.find({
      pollId: poll._id,
      isMandatory: true,
    });
    const answeredQuestionIds = answers.map((a: any) => a.questionId);

    for (const q of questions) {
      if (!answeredQuestionIds.includes(q._id.toString())) {
        res
          .status(400)
          .json({
            success: false,
            error: `Mandatory question missing: ${q.text}`,
          });
        return;
      }
    }

    // 5. SAVE RESPONSE
    await Response.create({
      pollId: poll._id,
      voterId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      answers,
    });

    // 6. EMIT REAL-TIME UPDATE TO CREATOR'S DASHBOARD
    const io = req.app.get('io');
    if (io) {
      // Re-fetch analytics dynamically
      const { getPollAnalytics } = require('../services/analytics.service');
      const updatedAnalytics = await getPollAnalytics(poll._id.toString());

      // Broadcast specifically to the room watching this poll
      io.to(`poll_${poll._id.toString()}`).emit(
        'poll_updated',
        updatedAnalytics,
      );
    }

    res
      .status(201)
      .json({ success: true, message: 'Vote submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
