"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type { Task } from "@/lib/types";
import { useMemo } from "react";
import { addDays, startOfDay } from "date-fns";

interface StudyCalendarProps {
  tasks: Task[];
}

export function StudyCalendar({ tasks }: StudyCalendarProps) {
  const taskDays = useMemo(() => {
    return tasks.map(task => startOfDay(new Date(task.deadline)));
  }, [tasks]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="font-headline text-xl">Monthly Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          modifiers={{
            taskDay: taskDays,
          }}
          modifiersClassNames={{
            taskDay: "task-day",
          }}
          className="p-0"
        />
        <style>{`
          .task-day { 
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
    </Card>
  );
}
