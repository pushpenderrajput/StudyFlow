"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type { Task } from "@/lib/types";
import { useMemo } from "react";
import { startOfDay } from "date-fns";
import { Quote } from "lucide-react";

interface StudyCalendarProps {
  tasks: Task[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const QuotePanel = ({ text }: { text: string }) => (
    <div className="hidden lg:flex flex-col items-center justify-center w-[200px] p-4 text-center">
        <Quote className="h-6 w-6 text-muted-foreground/50 mb-2" />
        <p className="text-sm italic text-muted-foreground">{text}</p>
    </div>
);

export function StudyCalendar({ tasks, selectedDate, onDateSelect }: StudyCalendarProps) {
  const taskDays = useMemo(() => {
    return tasks.map(task => startOfDay(new Date(task.deadline)));
  }, [tasks]);

  return (
    <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background to-accent/20 opacity-50 z-0"></div>
        <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="font-headline text-xl">Monthly Plan</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <QuotePanel text="The secret of getting ahead is getting started." />
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    modifiers={{
                        taskDay: taskDays,
                    }}
                    modifiersClassNames={{
                        taskDay: "task-day",
                    }}
                    className="p-0"
                />
                 <QuotePanel text="Focus on being productive instead of busy." />
                <style>{`
                .task-day:not(.rdp-day_selected) { 
                    font-weight: bold;
                    color: hsl(var(--primary));
                    background-color: hsl(var(--accent));
                    border-radius: 9999px;
                }
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                    background-color: hsl(var(--primary)) !important;
                    color: hsl(var(--primary-foreground)) !important;
                }
                `}</style>
            </CardContent>
        </div>
    </Card>
  );
}
