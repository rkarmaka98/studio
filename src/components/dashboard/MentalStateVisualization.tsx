
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { MentalStateVisualizationData, User } from "@/types";
import { generateMentalStateVisualization } from "@/lib/actions";
import { authStore } from "@/lib/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MentalStateVisualizationProps {
  currentUser: User;
}

export function MentalStateVisualization({ currentUser }: MentalStateVisualizationProps) {
  const [visualizationData, setVisualizationData] = useState<MentalStateVisualizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const questionnaireString = authStore.getQuestionnaireString(currentUser.id);
      const chatHistoryString = authStore.getChatHistoryString(currentUser.id);

      const result = await generateMentalStateVisualization(
        currentUser.id,
        questionnaireString,
        chatHistoryString
      );

      if (result.success && result.data) {
        setVisualizationData(result.data);
      } else {
        setError(result.message || "Failed to load visualization.");
      }
    } catch (err) {
      console.error("Visualization fetch error:", err);
      setError("An unexpected error occurred while fetching visualization data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="w-full h-full flex flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Your Mental State Snapshot</CardTitle>
          <CardDescription>A visual representation based on your interactions.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchData} disabled={isLoading} aria-label="Refresh visualization">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        {isLoading && !error && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Generating your visualization...</p>
          </div>
        )}
        {error && !isLoading && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && visualizationData && (
          <div className="space-y-4 w-full">
            {visualizationData.visualizationDataUri.startsWith('data:image/') ? (
              <Image
                src={visualizationData.visualizationDataUri}
                alt="Mental State Visualization"
                width={500}
                height={300}
                className="rounded-md border object-contain mx-auto shadow-md"
                data-ai-hint="abstract chart"
              />
            ) : (
               <div className="text-center p-4 border rounded-md bg-muted">
                 <p className="text-muted-foreground">Visualization data received, but it's not a displayable image URI.</p>
                 <p className="text-xs truncate mt-2">{visualizationData.visualizationDataUri.substring(0,100)}...</p>
               </div>
            )}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{visualizationData.analysisSummary}</p>
              </CardContent>
            </Card>
          </div>
        )}
        {!isLoading && !error && !visualizationData && (
            <p className="text-muted-foreground">No visualization data available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
