
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { MentalStateVisualization } from "@/components/dashboard/MentalStateVisualization";
import { Logo } from "@/components/Logo";
import { authStore } from "@/lib/authStore";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authStore.getUser();
    if (!user) {
      router.replace("/login");
    } else if (!user.questionnaireCompleted) {
      router.replace("/questionnaire");
    } else {
      setCurrentUser(user);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    authStore.clearUser();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/");
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {currentUser.username}!</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[calc(100vh-10rem)]">
          <div className="lg:col-span-1 h-full">
            <ChatInterface currentUser={currentUser} />
          </div>
          <div className="lg:col-span-1 h-full">
            <MentalStateVisualization currentUser={currentUser} />
          </div>
        </div>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} ReflexAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
