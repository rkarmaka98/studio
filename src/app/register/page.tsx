
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/actions";
import { authStore } from "@/lib/authStore";
import type { User } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password?: string }) => {
    setIsLoading(true);
    try {
      // Password is included in values by AuthForm, but not explicitly used in mock registerUser
      const result = await registerUser({ username: values.username });
      if (result.success && result.userId) {
        const newUser: User = {
          id: result.userId,
          username: values.username,
          questionnaireCompleted: false,
        };
        authStore.setUser(newUser);
        toast({ title: "Registration Successful", description: "Welcome to Therapie! Let's get to know you." });
        router.push("/questionnaire");
      } else {
        toast({ title: "Registration Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8">
        <Link href="/">
          <Logo size={40} />
        </Link>
      </div>
      <AuthForm
        mode="register"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        footer={
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        }
      />
    </div>
  );
}
