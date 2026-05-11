import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button'; // Will create these generic UI components soon
import { Input } from '../components/ui/Input';

// Zod schema exactly mirroring our backend rules
const pollSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  responseMode: z.enum(['anonymous', 'authenticated']),
  expiresAt: z.string().min(1, "Expiry date is required")
});

type PollFormValues = z.infer<typeof pollSchema>;

interface Props {
  onSubmit: (data: PollFormValues) => void;
  isLoading: boolean;
}

export const CreatePollForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: { responseMode: 'anonymous' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Poll Title</label>
        <Input {...register('title')} placeholder="What is your favorite..." className="w-full" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea {...register('description')} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" rows={3}></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Response Mode</label>
          <select {...register('responseMode')} className="w-full border-gray-300 rounded-md shadow-sm p-2 border bg-white">
            <option value="anonymous">Anonymous (Anyone with link)</option>
            <option value="authenticated">Authenticated (Login required)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date & Time</label>
          <Input type="datetime-local" {...register('expiresAt')} className="w-full" />
          {errors.expiresAt && <p className="text-red-500 text-sm mt-1">{errors.expiresAt.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full py-3">
        {isLoading ? 'Creating...' : 'Create Poll & Add Questions'}
      </Button>
    </form>
  );
};
