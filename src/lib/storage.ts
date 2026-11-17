import { Preferences } from '@capacitor/preferences';

import type { StoredUser } from './auth';
import type { Task } from './tasks';

export const SESSION_KEY = 'todo:session';
export const USERS_KEY = 'todo:users';
export const tasksKey = (user: string): string => `todo:tasks:${user}`;

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): Promise<void> =>
  Preferences.set({ key, value: JSON.stringify(value) });

export const loadTasks = (user: string): Promise<Task[]> => readJson<Task[]>(tasksKey(user), []);

export const saveTasks = (user: string, tasks: Task[]): Promise<void> => writeJson(tasksKey(user), tasks);

export const loadUsers = (): Promise<StoredUser[]> => readJson<StoredUser[]>(USERS_KEY, []);

export const saveUsers = (users: StoredUser[]): Promise<void> => writeJson(USERS_KEY, users);

export const getSessionUser = async (): Promise<string | null> => (await Preferences.get({ key: SESSION_KEY })).value;

export const setSessionUser = (user: string | null): Promise<void> =>
  user ? Preferences.set({ key: SESSION_KEY, value: user }) : Preferences.remove({ key: SESSION_KEY });
