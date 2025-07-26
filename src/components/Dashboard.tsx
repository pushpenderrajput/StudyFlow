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
} from "date-fns";
import { BookOpenCheck } from "lucide-react";
import { StudyCalendar } from "@/components/StudyCalendar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard } from "@/components/TaskCard";
import { SelectedDayTasks } from "@/components/SelectedDayTasks";
import { Button } from "./ui/button";
import { EditTaskDialog } from "./EditTaskDialog";

const motivationalQuotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "The secret of your future is hidden in your daily routine.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The expert in anything was once a beginner.",
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setIsClient(true);
    // Set selectedDate to today only on the client
    setSelectedDate(new Date()); 
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
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
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
    setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => {
        if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }));
  }

  const handleEditTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t).sort((a, b) => {
       if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }));
    setEditingTask(null);
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

  if (!isClient) {
    return null; // or a loading spinner
  }

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
    <>
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-800">
              StudyFlow
            </h1>
            <p className="text-sm text-muted-foreground italic">
              {quote}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <StudyCalendar tasks={tasks} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
           {selectedDate && <SelectedDayTasks selectedDate={selectedDate} tasks={selectedDayTasks} onToggle={toggleTaskCompletion} onAddTask={handleAddTask} onEditTask={setEditingTask}/>}
           <TaskCard title="All Monthly Tasks" tasks={monthlyTasks} onToggle={toggleTaskCompletion} onEditTask={setEditingTask}/>
        </div>
        <div className="space-y-8">
          <ProgressTracker daily={dailyProgress} weekly={weeklyProgress} monthly={monthlyProgress} />
          <TaskCard title="Today's Focus" tasks={todayTasks} onToggle={toggleTaskCompletion} onEditTask={setEditingTask} isTodayCard={true} />
          <TaskCard title="This Weekend's Grind" tasks={weekendTasks} onToggle={toggleTaskCompletion} onEditTask={setEditingTask}>
            <div className="mt-4 flex justify-center">
              <Button onClick={forwardWeekendTasks} variant="outline" size="sm">
                Forward All to Next Weekend
              </Button>
            </div>
          </TaskCard>
        </div>
      </div>
    </div>
    {editingTask && (
        <EditTaskDialog 
            task={editingTask}
            onSave={handleEditTask}
            onClose={() => setEditingTask(null)}
        />
    )}
    </>
  );
}
