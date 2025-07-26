"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DailyScheduler } from "./DailyScheduler";

interface SelectedDayTasksProps {
  selectedDate: Date;
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onEditTask: (task: Task) => void;
}

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required."),
  topic: z.string().optional(),
  duration: z.coerce.number().int().positive().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM).").optional(),
  link: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function SelectedDayTasks({ selectedDate, tasks, onToggle, onAddTask, onEditTask }: SelectedDayTasksProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      topic: "",
      duration: undefined,
      startTime: "",
      link: ""
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
            <DailyScheduler tasks={tasks} onToggleTask={onToggle} onEditTask={onEditTask} />
            <div className="space-y-4 border-t pt-6 mt-6">
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
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/resource" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
