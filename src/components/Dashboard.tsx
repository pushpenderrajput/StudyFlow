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
  isSameDay,
  addDays,
  nextSaturday,
  nextSunday,
} from "date-fns";
import { BookOpenCheck } from "lucide-react";
import { StudyCalendar } from "@/components/StudyCalendar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard } from "@/components/TaskCard";
import { SelectedDayTasks } from "@/components/SelectedDayTasks";
import { Button } from "./ui/button";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setIsClient(true);
    const storedTasks = localStorage.getItem("studyFlowTasks");
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("studyFlowTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const handleAddTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const forwardWeekendTasks = () => {
    setTasks(tasks.map(task => {
      const taskDate = new Date(task.deadline);
      if ((isSaturday(taskDate) || isSunday(taskDate)) && !task.completed) {
        const nextWeekDate = addDays(taskDate, 7);
        return { ...task, deadline: nextWeekDate.toISOString() };
      }
      return task;
    }));
  };

  const todayTasks = useMemo(
    () => tasks.filter((task) => {
      try {
        return isToday(new Date(task.deadline));
      } catch (e) { return false; }
    }),
    [tasks]
  );
  
  const weekendTasks = useMemo(
    () => tasks.filter((task) => {
      try {
        const taskDate = new Date(task.deadline);
        const now = new Date();
        const start = startOfWeek(now);
        const end = endOfWeek(now);
        return isWithinInterval(taskDate, { start, end }) && (isSaturday(taskDate) || isSunday(taskDate));
      } catch (e) { return false; }
    }),
    [tasks]
  );
  
  const selectedDayTasks = useMemo(
    () => selectedDate ? tasks.filter((task) => {
      try {
        return isSameDay(new Date(task.deadline), selectedDate);
      } catch (e) { return false; }
    }) : [],
    [tasks, selectedDate]
  );
  
  const monthlyTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      try {
        return isWithinInterval(new Date(t.deadline), { start: startOfMonth(now), end: endOfMonth(now) })
      } catch(e) { return false; }
    });
  }, [tasks]);

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
  const weeklyProgress = calculateProgress(tasks.filter(t => {
      try {
        return isWithinInterval(new Date(t.deadline), { start: startOfWeek(now), end: endOfWeek(now) })
      } catch(e) { return false; }
    }
  ));
  const monthlyProgress = calculateProgress(monthlyTasks);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            StudyFlow
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <StudyCalendar tasks={tasks} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
           {selectedDate && <SelectedDayTasks selectedDate={selectedDate} tasks={selectedDayTasks} onToggle={toggleTaskCompletion} onAddTask={handleAddTask}/>}
           <TaskCard title="All Monthly Tasks" tasks={monthlyTasks} onToggle={toggleTaskCompletion} />
        </div>
        <div className="space-y-8">
          <ProgressTracker daily={dailyProgress} weekly={weeklyProgress} monthly={monthlyProgress} />
          <TaskCard title="Today's Focus" tasks={todayTasks} onToggle={toggleTaskCompletion} isTodayCard={true} />
          <TaskCard title="This Weekend's Grind" tasks={weekendTasks} onToggle={toggleTaskCompletion}>
            <div className="mt-4 flex justify-center">
              <Button onClick={forwardWeekendTasks} variant="outline" size="sm">
                Forward All to Next Weekend
              </Button>
            </div>
          </TaskCard>
        </div>
      </div>
    </div>
  );
}
