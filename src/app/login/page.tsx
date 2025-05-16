
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
    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const storedUser = authStore.getUser();
    let sessionUser: User;

    if (storedUser && storedUser.username.toLowerCase() === values.username.toLowerCase()) {
      // User exists in localStorage and username matches - this is our "existing" user.
      sessionUser = storedUser; // Use the complete user object from storage.
      toast({ title: "Login Successful", description: `Welcome back, ${sessionUser.username}!` });
    } else {
      // No user in localStorage, or username does not match.
      // For this mock, we treat this as a new session for the entered username.
      // In a real app, this would typically be a failed login if credentials didn't match a DB record.
      const newUserId = `user_${Date.now()}_${values.username.toLowerCase().replace(/\s+/g, '_')}`;
      sessionUser = {
        id: newUserId,
        username: values.username,
        questionnaireCompleted: false, // New "session" or "user", questionnaire not yet completed.
      };
      // This effectively replaces any previously stored user in the single-user mock.
      toast({ title: "Login Successful", description: `Welcome, ${sessionUser.username}! Let's get you set up.` });
    }
    
    authStore.setUser(sessionUser); // Set the determined user (either existing or new for the mock)

    if (sessionUser.questionnaireCompleted) {
      router.push("/dashboard");
    } else {
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
