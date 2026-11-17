import type { Task } from './tasks';

export const API_URL = 'https://jsonplaceholder.typicode.com';
const IMPORT_LIMIT = 5;

interface RemoteTodo {
  id: number;
  title: string;
  completed: boolean;
}

const getJson = async (response: Response): Promise<unknown> => {
  if (!response.ok) throw new Error(`La API respondió con estado ${response.status}.`);
  return response.json();
};

const isRemoteTodo = (value: unknown): value is RemoteTodo =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'title' in value &&
  typeof (value as RemoteTodo).id === 'number' &&
  typeof (value as RemoteTodo).title === 'string';

export const importTasks = async (fetchImpl: typeof fetch = fetch, limit = IMPORT_LIMIT): Promise<Task[]> => {
  const data = await getJson(await fetchImpl(`${API_URL}/todos?_limit=${limit}`));
  if (!Array.isArray(data)) throw new Error('La API devolvió un formato inválido.');

  return data.filter(isRemoteTodo).map((todo) => ({
    id: `api-${todo.id}`,
    title: todo.title,
    description: todo.completed ? 'Importada desde la API (completada)' : 'Importada desde la API',
    createdAt: Date.now(),
  }));
};

export const syncTasks = async (tasks: Task[], fetchImpl: typeof fetch = fetch): Promise<number> => {
  let synced = 0;

  for (const task of tasks) {
    const response = await fetchImpl(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title, body: task.description, completed: false }),
    });

    if (!response.ok) {
      throw new Error(`No se pudo sincronizar "${task.title}" (estado ${response.status}).`);
    }
    synced += 1;
  }

  return synced;
};
