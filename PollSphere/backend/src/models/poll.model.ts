import mongoose, { Document, Schema } from 'mongoose';

export interface IPoll extends Document {
  title: string;
  description?: string;
  creatorId: string; // Clerk User ID
  responseMode: 'anonymous' | 'authenticated';
  expiresAt: Date;
  status: 'draft' | 'active' | 'expired' | 'published';
}

const pollSchema = new Schema<IPoll>(
  {
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: String, required: true, index: true },
    responseMode: { type: String, enum: ['anonymous', 'authenticated'], required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'expired', 'published'], default: 'draft' }
  },
  { timestamps: true }
);

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
