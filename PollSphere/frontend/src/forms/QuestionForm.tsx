import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters"),
  isMandatory: z.boolean().default(true),
  options: z.array(
    z.object({ value: z.string().min(1, "Option cannot be empty") })
  ).min(2, "At least 2 options are required")
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Props {
  onSubmit: (data: { text: string; isMandatory: boolean; options: string[] }) => void;
  isLoading: boolean;
}

export const QuestionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      isMandatory: true,
      options: [{ value: '' }, { value: '' }] // Start with 2 empty options by default
    }
  });

  // useFieldArray allows us to dynamically add/remove inputs for the options
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const submitHandler = (data: QuestionFormValues) => {
    onSubmit({
      text: data.text,
      isMandatory: data.isMandatory,
      options: data.options.map(opt => opt.value) // Extract strings from object structure
    });
    reset({ text: '', isMandatory: true, options: [{ value: '' }, { value: '' }] }); 
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Add a Question</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
        <Input {...register('text')} placeholder="e.g., What time should we meet?" className="w-full" />
        {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>}
      </div>

      <div className="flex items-center mt-2">
        <input type="checkbox" {...register('isMandatory')} id="isMandatory" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label htmlFor="isMandatory" className="ml-2 block text-sm text-gray-900">Make this question mandatory</label>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mb-2">
            <Input 
              {...register(`options.${index}.value` as const)} 
              placeholder={`Option ${index + 1}`} 
              className="flex-1"
            />
            {fields.length > 2 && (
              <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options.message}</p>}
        {errors.options?.root && <p className="text-red-500 text-sm mt-1">{errors.options.root.message}</p>}
        
        <Button type="button" variant="secondary" onClick={() => append({ value: '' })} className="mt-2 text-sm flex items-center gap-1">
          <Plus size={16} /> Add Option
        </Button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full mt-6">
        {isLoading ? 'Adding...' : 'Save Question'}
      </Button>
    </form>
  );
};
