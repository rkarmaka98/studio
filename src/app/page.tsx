
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { authStore } from "@/lib/authStore";
import { ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authStore.getUser();
    if (user) {
      if (user.questionnaireCompleted) {
        router.replace("/dashboard");
      } else {
        router.replace("/questionnaire");
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/30 p-4">
      <div className="flex flex-col items-center space-y-8 max-w-lg"> {/* Changed from text-center */}
        <Logo size={60} className="mx-auto text-primary-foreground" />
        
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl text-center"> {/* Added text-center here for explicitness if needed for h1's internal text, though items-center centers the block */}
          Welcome to Therapie
        </h1>
        <p className="text-xl text-muted-foreground text-center"> {/* Added text-center here */}
          Your personalized companion for mental wellness and self-reflection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
            <Link href="/login">
              Login <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="shadow-lg transition-transform hover:scale-105 border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <Link href="/register">
              Register <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-8 text-center"> {/* Added text-center here */}
          Discover insights, track your mood, and engage in meaningful conversations tailored just for you.
        </p>
      </div>
    </div>
  );
}

