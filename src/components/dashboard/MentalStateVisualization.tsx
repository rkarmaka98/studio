
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { MentalStateVisualizationData, User } from "@/types";
import { generateMentalStateVisualization } from "@/lib/actions";
import { authStore } from "@/lib/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell, ResponsiveContainer } from "recharts";

interface MentalStateVisualizationProps {
  currentUser: User;
}

const chartConfig = {
  happy: { label: "Happy", color: "hsl(var(--chart-1))" },
  sad: { label: "Sad", color: "hsl(var(--chart-2))" },
  anxiety: { label: "Anxiety", color: "hsl(var(--chart-3))" },
  anger: { label: "Anger", color: "hsl(var(--chart-4))" },
  depressed: { label: "Depressed", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

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
        {!isLoading && !error && visualizationData && visualizationData.barChartData && (
          <div className="space-y-4 w-full h-[350px]"> {/* Added height for chart container */}
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={visualizationData.barChartData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis 
                    dataKey="metric" 
                    type="category" 
                    width={80} 
                    tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--accent) / 0.2)" }}
                    content={<ChartTooltipContent />} 
                  />
                  {/* <Legend /> // Legend might be redundant if Y-axis labels are clear */}
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {visualizationData.barChartData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.metric}`} 
                        fill={chartConfig[entry.metric as keyof typeof chartConfig]?.color || 'hsl(var(--primary))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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
        {!isLoading && !error && (!visualizationData || !visualizationData.barChartData) && (
            <p className="text-muted-foreground">No visualization data available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
