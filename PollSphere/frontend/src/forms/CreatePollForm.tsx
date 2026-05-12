import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { AlertCircle, Settings2 } from 'lucide-react';

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
    <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b-2 border-foreground p-6 sm:p-8">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Settings2 size={24} />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Poll Title</Label>
            <Input {...register('title')} placeholder="What is your favorite..." />
            {errors.title && (
              <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={14} />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <textarea 
              {...register('description')} 
              className="flex min-h-[100px] w-full rounded-xl border-2 border-foreground bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              placeholder="Provide some context for your voters..."
              rows={3}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Response Mode</Label>
              <select 
                {...register('responseMode')} 
                className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all cursor-pointer appearance-none"
              >
                <option value="anonymous">Anyone with link</option>
                <option value="authenticated">Login required</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date & Time</Label>
              <Input type="datetime-local" {...register('expiresAt')} />
              {errors.expiresAt && (
                <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1.5">
                  <AlertCircle size={14} />
                  {errors.expiresAt.message}
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-14 text-lg font-black border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all mt-4"
          >
            {isLoading ? 'Creating...' : 'Create Poll & Add Questions →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
