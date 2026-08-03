import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Poll } from '../models/poll.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { Response as ResponseModel } from '../models/response.model';

export const createPoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId; 
    if (!creatorId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    
    // req.body is already validated by Zod at this point
    const { title, description, responseMode, expiresAt } = req.body;
    
    const newPoll = await Poll.create({
      title,
      description,
      creatorId,
      responseMode,
      expiresAt: new Date(expiresAt),
      status: 'draft'
    });
    
    res.status(201).json({ success: true, poll: newPoll });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyPolls = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    if (!creatorId) {
       res.status(401).json({ success: false, error: "Unauthorized" });
       return;
    }
    
    const polls = await Poll.find({ creatorId }).sort({ createdAt: -1 }).lean();

    const enrichedPolls = await Promise.all(
      polls.map(async (p) => {
        const pollIdStr = p._id.toString();
        let pollObjId = p._id;
        try {
          pollObjId = new mongoose.Types.ObjectId(pollIdStr);
        } catch (e) {
          // ignore
        }

        const qCount = await Question.countDocuments({ 
          $or: [{ pollId: pollObjId }, { pollId: pollIdStr }] 
        });

        const rCount = await ResponseModel.countDocuments({ 
          $or: [{ pollId: pollObjId }, { pollId: pollIdStr }] 
        });

        return {
          ...p,
          questionCount: qCount > 0 ? qCount : 1,
          responseCount: rCount,
          totalVotes: rCount,
        };
      })
    );

    res.status(200).json({ success: true, polls: enrichedPolls });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPollById = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id } = req.params;
    
    const poll = await Poll.findOne({ _id: id, creatorId });
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }
    
    // Also fetch the questions and options for this poll
    const questions = await Question.find({ pollId: poll._id }).lean();
    
    // Fetch options for all questions
    const questionIds = questions.map(q => q._id);
    const options = await Option.find({ questionId: { $in: questionIds } }).lean();
    
    // Embed options into their respective questions for the API response
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: options.filter(o => o.questionId.toString() === q._id.toString())
    }));
    
    res.status(200).json({ success: true, poll, questions: questionsWithOptions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id } = req.params;
    
    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: id, creatorId },
      { $set: req.body }, // Body is already validated via Zod partial schema
      { new: true }
    );
    
    if (!updatedPoll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }
    
    res.status(200).json({ success: true, poll: updatedPoll });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id } = req.params;
    
    const poll = await Poll.findOneAndDelete({ _id: id, creatorId });
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }
    
    // Cleanup associated questions and options
    const questions = await Question.find({ pollId: id });
    const questionIds = questions.map(q => q._id);
    
    await Option.deleteMany({ questionId: { $in: questionIds } });
    await Question.deleteMany({ pollId: id });
    
    res.status(200).json({ success: true, message: "Poll and all associated data deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
