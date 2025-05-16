
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";
import { useToast } from "@/hooks/use-toast";
import { submitQuestionnaire } from "@/lib/actions";
import { authStore } from "@/lib/authStore";
import type { QuestionnaireAnswers }_NEW_LINE_import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export default function QuestionnairePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(authStore.getUser());

  useEffect(() => {
    const user = authStore.getUser();
    if (!user) {
      router.replace("/login");
    } else if (user.questionnaireCompleted) {
      router.replace("/dashboard");
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  const handleSubmit = async (values: QuestionnaireAnswers) => {
    if (!currentUser) {
      toast({ title: "Error", description: "User not found. Please log in again.", variant: "destructive" });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const result = await submitQuestionnaire(currentUser.id, values);
      if (result.success) {
        authStore.saveQuestionnaire(currentUser.id, values); // Save to localStorage
        // Optionally save result.analysis to localStorage or state
        toast({ title: "Questionnaire Submitted", description: "Your experience will now be personalized." });
        router.push("/dashboard");
      } else {
        toast({ title: "Submission Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Questionnaire submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.questionnaireCompleted) {
    // Render loading or redirecting state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background to-primary/10">
       <div className="mb-8">
          <Logo size={40} />
      </div>
      <QuestionnaireForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
