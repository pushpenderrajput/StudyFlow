"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle, Clock } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


interface SelectedDayTasksProps {
  selectedDate: Date;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required."),
  topic: z.string().optional(),
  duration: z.coerce.number().int().positive().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function SelectedDayTasks({ selectedDate, tasks, onToggle, onAddTask }: SelectedDayTasksProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      topic: "",
      duration: undefined,
    },
  });

  const onSubmit = (data: TaskFormData) => {
    onAddTask({
      ...data,
      deadline: selectedDate.toISOString(),
    });
    form.reset();
  };
  
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                     <div key={task.id} className="flex items-start space-x-3 group transition-all">
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={() => onToggle(task.id)}
                          aria-label={`Mark task "${task.taskName}" as ${task.completed ? 'incomplete' : 'complete'}`}
                           className="mt-1"
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
                           <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.topic && <p className="font-semibold">{task.topic}</p>}
                             {task.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{task.duration} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No tasks for this day. Add one below!</p>
                )}
              </div>
            </ScrollArea>
             <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="taskName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Task</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Review binary trees" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., DSA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (min)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="E.g., 60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Task to this Day
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
