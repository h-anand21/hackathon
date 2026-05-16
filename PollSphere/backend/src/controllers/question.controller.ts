import { Request, Response } from 'express';
import { Poll } from '../models/poll.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id: pollId } = req.params;
    
    // 1. Verify Poll exists and belongs to the user trying to add a question
    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      res.status(404).json({ success: false, error: "Poll not found or unauthorized" });
      return;
    }

    // req.body is validated by Zod
    const { text, isMandatory, allowMultiple, options } = req.body;

    // 2. Create the Question
    const question = await Question.create({
      pollId,
      text,
      isMandatory,
      allowMultiple
    });

    // 3. Create the Options linked to the newly created Question
    const optionDocs = options.map((optText: string) => ({
      questionId: question._id,
      text: optText
    }));
    
    const createdOptions = await Option.insertMany(optionDocs);

    res.status(201).json({ success: true, question, options: createdOptions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id: questionId } = req.params;
    
    // Validate question belongs to a poll owned by this user
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ success: false, error: "Question not found" });
      return;
    }
    
    const poll = await Poll.findOne({ _id: question.pollId, creatorId });
    if (!poll) {
      res.status(403).json({ success: false, error: "Unauthorized" });
      return;
    }
    
    // Partially update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: req.body }, // Assumes Zod partial validation
      { new: true }
    );
    
    res.status(200).json({ success: true, question: updatedQuestion });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.auth.userId;
    const { id: questionId } = req.params;
    
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ success: false, error: "Question not found" });
      return;
    }
    
    const poll = await Poll.findOne({ _id: question.pollId, creatorId });
    if (!poll) {
      res.status(403).json({ success: false, error: "Unauthorized" });
      return;
    }
    
    await Option.deleteMany({ questionId: question._id });
    await Question.findByIdAndDelete(questionId);
    
    res.status(200).json({ success: true, message: "Question and options deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
