import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { AlertCircle, Plus, Trash2, HelpCircle } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters"),
  isMandatory: z.boolean().default(true),
  allowMultiple: z.boolean().default(false),
  options: z.array(
    z.object({ value: z.string().min(1, "Option cannot be empty") })
  ).min(2, "At least 2 options are required")
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Props {
  onSubmit: (data: { text: string; isMandatory: boolean; allowMultiple: boolean; options: string[] }) => void;
  isLoading: boolean;
  initialData?: { text: string; isMandatory: boolean; allowMultiple: boolean; options: string[] } | null;
}

export const QuestionForm: React.FC<Props> = ({ onSubmit, isLoading, initialData }) => {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: initialData?.text || '',
      isMandatory: initialData?.isMandatory ?? true,
      allowMultiple: initialData?.allowMultiple ?? false,
      options: initialData?.options?.map(val => ({ value: val })) || [{ value: '' }, { value: '' }]
    }
  });

  // Update form when initialData changes (Edit mode)
  React.useEffect(() => {
    if (initialData) {
      reset({
        text: initialData.text,
        isMandatory: initialData.isMandatory,
        allowMultiple: initialData.allowMultiple,
        options: initialData.options.map(val => ({ value: val }))
      });
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const submitHandler = (data: any) => {
    onSubmit({
      text: data.text,
      isMandatory: data.isMandatory,
      allowMultiple: data.allowMultiple,
      options: data.options.map((opt: any) => opt.value)
    });
    reset({ text: '', isMandatory: true, allowMultiple: false, options: [{ value: '' }, { value: '' }] }); 
  };

  return (
    <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden mt-6">
      <CardHeader className="bg-primary/5 border-b-2 border-foreground p-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <HelpCircle size={20} className="text-primary" />
          Add a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Input {...register('text')} placeholder="e.g., What time should we meet?" />
            {errors.text && (
              <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={14} />
                {(errors.text as any)?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
              <input 
                type="checkbox" 
                {...register('isMandatory')} 
                id="isMandatory" 
                className="h-5 w-5 rounded border-2 border-foreground bg-background text-primary focus:ring-primary transition-all cursor-pointer" 
              />
              <Label htmlFor="isMandatory" className="mb-0 cursor-pointer text-sm">Make this question mandatory</Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border-2 border-primary/20">
              <input 
                type="checkbox" 
                {...register('allowMultiple')} 
                id="allowMultiple" 
                className="h-5 w-5 rounded border-2 border-primary bg-background text-primary focus:ring-primary transition-all cursor-pointer" 
              />
              <Label htmlFor="allowMultiple" className="mb-0 cursor-pointer text-sm font-bold text-primary">Allow multiple selections</Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Options</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="group animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-foreground bg-muted font-bold text-xs">
                      {index + 1}
                    </div>
                    <Input 
                      {...register(`options.${index}.value` as const)} 
                      placeholder={`Enter option ${index + 1}`} 
                      className="flex-1"
                    />
                    {fields.length > 2 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => remove(index)} 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                  {(errors as any).options?.[index]?.value && (
                    <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1.5 ml-12">
                      <AlertCircle size={14} />
                      {(errors as any).options?.[index]?.value?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {errors.options && !Array.isArray(errors.options) && (
              <p className="text-destructive text-xs font-bold flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={14} />
                {(errors as any).options?.message}
              </p>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => append({ value: '' })} 
              className="mt-2 font-bold border-2 border-foreground hover:bg-primary/5 transition-all"
            >
              <Plus size={16} /> Add Option
            </Button>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 font-black border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all mt-6"
          >
            {isLoading ? 'Saving...' : 'Save Question →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
