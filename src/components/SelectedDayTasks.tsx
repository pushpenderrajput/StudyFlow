
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface SelectedDayTasksProps {
  selectedDate: Date;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export function SelectedDayTasks({ selectedDate, tasks, onToggle, onAddTask }: SelectedDayTasksProps) {
  const [newTaskName, setNewTaskName] = useState("");

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      onAddTask({
        taskName: newTaskName.trim(),
        deadline: selectedDate.toISOString(),
      });
      setNewTaskName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          Tasks for {format(selectedDate, "MMMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40 mb-4">
          <div className="space-y-4 pr-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task.id)}
                    aria-label={`Mark task "${task.taskName}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  <Label
                    htmlFor={task.id}
                    className={cn(
                      "font-medium cursor-pointer",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.taskName}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No tasks for this day.</p>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button onClick={handleAddTask} size="icon">
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Add Task</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
