import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Poll } from '../models/poll.model';
import { getPollAnalytics } from '../services/analytics.service';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  const { pollId } = req.params;
  try {
    const creatorId = req.auth.userId;

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      res.status(400).json({ success: false, error: "Invalid Poll ID format" });
      return;
    }

    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }

    const analytics = await getPollAnalytics(pollId);

    res.status(200).json({ success: true, poll, analytics });
  } catch (error: any) {
    console.error("Analytics Error for pollId:", pollId, error);
    res.status(500).json({ 
      success: false, 
      error: `Server Error: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Public endpoint for when poll is published
export const getPublicResults = async (req: Request, res: Response): Promise<void> => {
  const { shareId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(shareId)) {
      res.status(400).json({ success: false, error: "Invalid share ID format" });
      return;
    }

    const poll = await Poll.findById(shareId);
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found" });
      return;
    }

    if (poll.status !== 'published') {
      res.status(403).json({ success: false, error: "Results are not public yet." });
      return;
    }

    const analytics = await getPollAnalytics(shareId, 100);

    res.status(200).json({ success: true, poll, analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
