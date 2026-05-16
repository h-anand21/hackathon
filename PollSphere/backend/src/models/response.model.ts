import mongoose, { Document, Schema } from 'mongoose';

interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  optionId?: mongoose.Types.ObjectId; // Used for single-select
  optionIds?: mongoose.Types.ObjectId[]; // Used for multi-select
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
      optionId: { type: Schema.Types.ObjectId, ref: 'Option' },
      optionIds: [{ type: Schema.Types.ObjectId, ref: 'Option' }]
    }]
  }, 
  { timestamps: true }
);

// The unique index on { pollId: 1, voterId: 1 } was removed because it blocked anonymous users
// who all have voterId: null. Duplicate checking is handled entirely in the controller now.

export const Response = mongoose.model<IResponse>('Response', responseSchema);
