
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { authStore } from "@/lib/authStore";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password?: string }) => {
    setIsLoading(true);
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock login: check if user exists (even if it's just a new mock user for demo)
    // In a real app, this would call a server action to verify credentials.
    // For this mock, we'll assume any valid username format is a "login"
    // and create a mock user session.
    
    const mockUserId = `user_${Date.now()}_${values.username.toLowerCase()}`;
    // Try to retrieve existing user data, or create new if "logging in" for the first time in mock
    let user = authStore.getUser(); // This would typically be a server check
    let questionnaireCompleted = false;

    if (user && user.username.toLowerCase() === values.username.toLowerCase()) {
      // User "exists" in localStorage from a previous session/registration
      questionnaireCompleted = user.questionnaireCompleted;
    } else {
      // Simulate a "new" login - in a real app this means credentials matched an existing user.
      // For mock, we might not have questionnaire for this "login".
      const storedQuestionnaire = authStore.getQuestionnaire(mockUserId);
      questionnaireCompleted = !!storedQuestionnaire;
    }
    
    const loggedInUser: User = {
      id: user?.id || mockUserId, // Prefer existing ID if user "matched"
      username: values.username,
      questionnaireCompleted: questionnaireCompleted,
    };
    authStore.setUser(loggedInUser);

    toast({ title: "Login Successful", description: `Welcome back, ${values.username}!` });

    if (loggedInUser.questionnaireCompleted) {
      router.push("/dashboard");
    } else {
      // If somehow a user logs in but hasn't completed questionnaire (e.g. direct navigation in mock)
      router.push("/questionnaire");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8">
        <Link href="/">
          <Logo size={40} />
        </Link>
      </div>
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        footer={
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        }
      />
    </div>
  );
}
