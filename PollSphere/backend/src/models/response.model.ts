import mongoose, { Document, Schema } from 'mongoose';

interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  optionId: mongoose.Types.ObjectId;
}

export interface IResponse extends Document {
  pollId: mongoose.Types.ObjectId;
  voterId?: string; // Optional because of anonymous mode
  ipAddress?: string; // Used to prevent duplicate anonymous votes
  answers: IAnswer[];
}

const responseSchema = new Schema<IResponse>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    voterId: { type: String, index: true }, 
    ipAddress: { type: String },
    answers: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
      optionId: { type: Schema.Types.ObjectId, ref: 'Option', required: true }
    }]
  }, 
  { timestamps: true }
);

// Mongoose index to ensure a specific authenticated user can only vote ONCE per poll
responseSchema.index(
  { pollId: 1, voterId: 1 }, 
  { unique: true, partialFilterExpression: { voterId: { $exists: true } } }
);

export const Response = mongoose.model<IResponse>('Response', responseSchema);
