"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { Target, Coffee, AlertCircle } from "lucide-react";

interface TaskCardProps {
  title: string;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  isTodayCard?: boolean;
}

export function TaskCard({ title, tasks, onToggle, isTodayCard = false }: TaskCardProps) {
  const Icon = title.includes("Today") ? Target : Coffee;

  const getDeadlineColor = (deadline: string) => {
    const taskDate = new Date(deadline);
    if (isPast(taskDate) && !isToday(taskDate)) {
      return "text-red-500";
    }
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-4 pr-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 group transition-all">
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task.id)}
                    aria-label={`Mark task "${task.taskName}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={task.id}
                      className={cn(
                        "font-medium cursor-pointer transition-colors",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.taskName}
                    </Label>
                    <p className={cn("text-xs", getDeadlineColor(task.deadline))}>
                      {format(new Date(task.deadline), "MMM d")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm pt-8">
                <p>
                  {isTodayCard ? "No tasks for today. Great job!" : "No weekend tasks scheduled."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
