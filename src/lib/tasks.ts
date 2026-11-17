export interface TaskLocation {
  latitude: number;
  longitude: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  photo?: string;
  location?: TaskLocation;
  createdAt: number;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'photo' | 'location'>;

export const addTask = (tasks: Task[], input: TaskInput): Task[] => [
  { id: crypto.randomUUID(), ...input, createdAt: Date.now() },
  ...tasks,
];

export const updateTask = (tasks: Task[], id: string, changes: Partial<TaskInput>): Task[] =>
  tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));

export const removeTask = (tasks: Task[], id: string): Task[] => tasks.filter((task) => task.id !== id);

/** Agrega solo las tareas cuyo id todavía no está en la lista. */
export const mergeTasks = (current: Task[], incoming: Task[]): Task[] => {
  const currentIds = new Set(current.map((task) => task.id));
  return [...incoming.filter((task) => !currentIds.has(task.id)), ...current];
};
