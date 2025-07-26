"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Clock, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

interface DailySchedulerProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export function DailyScheduler({ tasks, onToggleTask, onEditTask }: DailySchedulerProps) {

  const getTaskPosition = (task: Task) => {
    if (!task.startTime || !task.duration) return { top: 0, height: 0 };
    const [startHour, startMinute] = task.startTime.split(":").map(Number);
    
    // Each hour slot is 60px high. 1px per minute.
    const top = startHour * 60 + startMinute;
    const height = task.duration;

    return { top, height };
  };

  const formatTime = (hour: number) => {
    return format(setMinutes(setHours(new Date(), hour), 0), "h a");
  };

  return (
    <div className="relative">
      <ScrollArea className="h-[500px] w-full">
        <div className="relative grid grid-cols-[auto_1fr] gap-x-4">
          {/* Time column */}
          <div className="flex flex-col text-right">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] text-xs text-muted-foreground pr-2 pt-[-2px] relative">
                <span className="absolute -top-1.5">{formatTime(hour)}</span>
              </div>
            ))}
          </div>
          
          {/* Schedule column */}
          <div className="relative">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-t border-border"></div>
            ))}
            
            {/* Tasks */}
            {tasks.map((task) => {
              if (!task.startTime || !task.duration) return null;
              const { top, height } = getTaskPosition(task);
              return (
                <div
                  key={task.id}
                  className="absolute w-full pr-2"
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <Card className={cn("w-full h-full p-2 flex flex-col justify-between transition-colors", 
                    task.completed ? "bg-muted/50" : "bg-accent/50 hover:bg-accent/80"
                  )}>
                    <div className="flex items-start gap-1">
                       <Checkbox
                          id={`scheduler-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          aria-label={`Mark task "${task.taskName}" as ${task.completed ? 'incomplete' : 'complete'}`}
                           className="mt-1"
                        />
                      <div className="flex-1 text-sm"  onClick={() => onEditTask(task)}>
                        <Label htmlFor={`scheduler-${task.id}`} className={cn(task.completed && "line-through text-muted-foreground")}>{task.taskName}</Label>
                       
                      </div>
                      
                    </div>
                     
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
