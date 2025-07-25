"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";

interface ProgressData {
  progress: number;
  completedCount: number;
  totalCount: number;
}

interface ProgressTrackerProps {
  daily: ProgressData;
  weekly: ProgressData;
  monthly: ProgressData;
}

const quotes = [
    "Don't wish for it. Work for it.",
    "The earlier you start working on something, the earlier you will see results."
];

export function ProgressTracker({ daily, weekly, monthly }: ProgressTrackerProps) {
  
  const ProgressView = ({ data, period }: { data: ProgressData, period: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-sm text-muted-foreground">{period} Progress</p>
        <p className="text-sm font-medium">{data.completedCount} / {data.totalCount} tasks</p>
      </div>
      <Progress value={data.progress} className="w-full h-2" />
    </div>
  );
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="font-headline text-xl">Progress Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="pt-4">
            <ProgressView data={daily} period="Daily"/>
          </TabsContent>
          <TabsContent value="weekly" className="pt-4">
            <ProgressView data={weekly} period="Weekly"/>
          </TabsContent>
          <TabsContent value="monthly" className="pt-4">
            <ProgressView data={monthly} period="Monthly"/>
          </TabsContent>
        </Tabs>
        <div className="text-center text-xs italic text-muted-foreground pt-4 mt-4 border-t">
            <p>{randomQuote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
