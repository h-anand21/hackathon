import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  pollId: mongoose.Types.ObjectId;
  text: string;
  isMandatory: boolean;
}

const questionSchema = new Schema<IQuestion>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    text: { type: String, required: true },
    isMandatory: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
