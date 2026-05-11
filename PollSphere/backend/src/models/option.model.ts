import mongoose, { Document, Schema } from 'mongoose';

export interface IOption extends Document {
  questionId: mongoose.Types.ObjectId;
  text: string;
}

const optionSchema = new Schema<IOption>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export const Option = mongoose.model<IOption>('Option', optionSchema);
