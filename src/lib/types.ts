export type Task = {
  id: string;
  taskName: string;
  deadline: string; // ISO string
  completed: boolean;
  topic?: string;
  duration?: number; // in minutes
  startTime?: string; // e.g., "09:00"
  link?: string;
};
