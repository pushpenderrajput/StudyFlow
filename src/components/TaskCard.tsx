"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, parse } from "date-fns";
import { Target, Coffee, Clock, Link as LinkIcon, Star, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface TaskCardProps {
  title: string;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  isTodayCard?: boolean;
  children?: React.ReactNode;
}

const emptyTodayQuotes = [
    "A clean slate for a productive day. What's first?",
    "No tasks for today. Time to plan your next victory!",
    "Your future self will thank you for the work you do today."
]

export function TaskCard({ title, tasks, onToggle, onEditTask, isTodayCard = false, children }: TaskCardProps) {
  const Icon = title.includes("Today") ? Target : Coffee;

  const getDeadlineColor = (deadline: string) => {
    const taskDate = new Date(deadline);
    if (isPast(taskDate) && !isToday(taskDate)) {
      return "text-red-500";
    }
    return "text-muted-foreground";
  };
  
  const formatTime = (timeString: string) => {
    try {
      const date = parse(timeString, "HH:mm", new Date());
      return format(date, "h:mm a");
    } catch {
      return "";
    }
  };
  
  const randomEmptyQuote = emptyTodayQuotes[Math.floor(Math.random() * emptyTodayQuotes.length)];

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
                <div key={task.id} className="flex items-start space-x-3 group transition-all">
                  <Checkbox
                    id={`card-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task.id)}
                    aria-label={`Mark task "${task.taskName}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <Label
                          htmlFor={`card-${task.id}`}
                          className={cn(
                            "font-medium cursor-pointer transition-colors",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.taskName}
                        </Label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEditTask(task)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Task</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      {task.topic && <p className="font-semibold">{task.topic}</p>}
                       {task.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.duration} min</span>
                        </div>
                      )}
                       {task.link && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                           <Link href={task.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            Resource
                          </Link>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className={cn("text-xs", getDeadlineColor(task.deadline))}>
                          {format(new Date(task.deadline), "MMM d")}
                        </p>
                        {task.startTime && (
                           <p className="text-xs text-muted-foreground font-semibold">{formatTime(task.startTime)}</p>
                        )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm pt-8 text-center">
                 <Star className="h-6 w-6 text-yellow-400 mb-2"/>
                <p>
                  {isTodayCard ? "No tasks for today. Great job!" : "No tasks scheduled."}
                </p>
                {isTodayCard && <p className="italic text-xs mt-1">{randomEmptyQuote}</p>}
              </div>
            )}
          </div>
        </ScrollArea>
        {children}
      </CardContent>
    </Card>
  );
}
