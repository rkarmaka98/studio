
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { questionnaireQuestions } from "@/lib/constants";
import type { QuestionnaireAnswers } from "@/types";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Create a dynamic schema based on questions
const formSchemaObject = questionnaireQuestions.reduce((obj, q) => {
  obj[q.id] = z.string().min(1, "Please provide an answer.");
  return obj;
}, {} as Record<string, z.ZodString>);

const formSchema = z.object(formSchemaObject);

type QuestionnaireFormValues = z.infer<typeof formSchema>;

interface QuestionnaireFormProps {
  onSubmit: (values: QuestionnaireFormValues) => Promise<void>;
  isLoading: boolean;
}

export function QuestionnaireForm({ onSubmit, isLoading }: QuestionnaireFormProps) {
  const form = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: questionnaireQuestions.reduce((obj, q) => {
      obj[q.id] = "";
      return obj;
    }, {} as QuestionnaireAnswers),
  });

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Tell Us About Yourself</CardTitle>
        <CardDescription>Your responses will help us personalize your ReflexAI experience. This is a one-time setup.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-6">
                {questionnaireQuestions.map((q, index) => (
                  <FormField
                    key={q.id}
                    control={form.control}
                    name={q.id as keyof QuestionnaireFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md">{index + 1}. {q.text}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your thoughts..."
                            rows={q.id === 'question5' ? 1 : 3} // Shorter for scale question
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
            <Button type="submit" className="w-full mt-8" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Answers
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
