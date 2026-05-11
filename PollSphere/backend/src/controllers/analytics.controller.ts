import { Request, Response } from 'express';
import { Poll } from '../models/poll.model';
import { getPollAnalytics } from '../services/analytics.service';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { pollId } = req.params;

    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }

    const analytics = await getPollAnalytics(pollId);

    res.status(200).json({ success: true, poll, analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Public endpoint for when poll is published
export const getPublicResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;

    const poll = await Poll.findById(shareId);
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found" });
      return;
    }

    if (poll.status !== 'published') {
      res.status(403).json({ success: false, error: "Results are not public yet." });
      return;
    }

    const analytics = await getPollAnalytics(shareId);

    res.status(200).json({ success: true, poll, analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
