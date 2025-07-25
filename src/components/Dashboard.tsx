"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Task } from "@/lib/types";
import {
  isToday,
  isSaturday,
  isSunday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { BookOpenCheck } from "lucide-react";
import { TaskImport } from "@/components/TaskImport";
import { StudyCalendar } from "@/components/StudyCalendar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard } from "@/components/TaskCard";

const initialTasks: Task[] = [
  { id: "1", taskName: "Review Chapter 1", deadline: new Date().toISOString(), completed: false },
  { id: "2", taskName: "Complete Math exercises", deadline: new Date().toISOString(), completed: true },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTasks = localStorage.getItem("studyFlowTasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(initialTasks);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("studyFlowTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const handleSetTasks = (newTasks: Omit<Task, 'id' | 'completed'>[]) => {
    const formattedNewTasks: Task[] = newTasks.map((task, index) => ({
      ...task,
      id: `task-${Date.now()}-${index}`,
      completed: false,
    }));
    setTasks(prevTasks => [...prevTasks, ...formattedNewTasks]);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const todayTasks = useMemo(
    () => tasks.filter((task) => isToday(new Date(task.deadline))),
    [tasks]
  );
  
  const weekendTasks = useMemo(
    () => tasks.filter((task) => {
      const taskDate = new Date(task.deadline);
      return isSaturday(taskDate) || isSunday(taskDate);
    }),
    [tasks]
  );

  const calculateProgress = (filteredTasks: Task[]) => {
    if (filteredTasks.length === 0) return { progress: 0, completedCount: 0, totalCount: 0 };
    const completedCount = filteredTasks.filter(t => t.completed).length;
    const totalCount = filteredTasks.length;
    return {
      progress: (completedCount / totalCount) * 100,
      completedCount,
      totalCount,
    };
  };

  const now = new Date();
  const dailyProgress = calculateProgress(todayTasks);
  const weeklyProgress = calculateProgress(tasks.filter(t => isWithinInterval(new Date(t.deadline), { start: startOfWeek(now), end: endOfWeek(now) })));
  const monthlyProgress = calculateProgress(tasks.filter(t => isWithinInterval(new Date(t.deadline), { start: startOfMonth(now), end: endOfMonth(now) })));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            StudyFlow
          </h1>
        </div>
        <TaskImport onTasksImported={handleSetTasks} />
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <StudyCalendar tasks={tasks} />
        </div>
        <div className="space-y-8">
          <ProgressTracker daily={dailyProgress} weekly={weeklyProgress} monthly={monthlyProgress} />
          <TaskCard title="Today's Focus" tasks={todayTasks} onToggle={toggleTaskCompletion} isTodayCard={true} />
          <TaskCard title="Weekend Grind" tasks={weekendTasks} onToggle={toggleTaskCompletion} />
        </div>
      </div>
    </div>
  );
}
