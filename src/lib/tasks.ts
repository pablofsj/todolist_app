export interface Task {
  id: string;
  title: string;
  description: string;
}

export const addTask = (tasks: Task[], title: string, description: string): Task[] => [
  { id: crypto.randomUUID(), title, description },
  ...tasks,
];

export const updateTask = (tasks: Task[], id: string, title: string, description: string): Task[] =>
  tasks.map((task) => (task.id === id ? { ...task, title, description } : task));

export const removeTask = (tasks: Task[], id: string): Task[] => tasks.filter((task) => task.id !== id);
