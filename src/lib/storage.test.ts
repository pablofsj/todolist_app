import { describe, expect, test, vi } from 'vitest';

import { getSessionUser, loadTasks, loadUsers, saveTasks, saveUsers, setSessionUser, tasksKey } from './storage';
import type { Task } from './tasks';

const store = vi.hoisted(() => new Map<string, string>());

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({ value: store.get(key) ?? null })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
    }),
    remove: vi.fn(async ({ key }: { key: string }) => {
      store.delete(key);
    }),
  },
}));

const task: Task = { id: 'a', title: 'Guardada', description: 'Persistente', createdAt: 1 };

describe('storage', () => {
  test('guarda y recupera las tareas de cada usuario', async () => {
    await saveTasks('ana', [task]);

    expect(store.get(tasksKey('ana'))).toContain('Guardada');
    await expect(loadTasks('ana')).resolves.toEqual([task]);
    await expect(loadTasks('otro')).resolves.toEqual([]);
  });

  test('devuelve una lista vacía si el JSON está corrupto', async () => {
    store.set(tasksKey('ana'), '{roto');

    await expect(loadTasks('ana')).resolves.toEqual([]);
  });

  test('guarda usuarios y la sesión activa', async () => {
    await saveUsers([{ username: 'ana', salt: 's', hash: 'h' }]);
    await expect(loadUsers()).resolves.toEqual([{ username: 'ana', salt: 's', hash: 'h' }]);

    await setSessionUser('ana');
    await expect(getSessionUser()).resolves.toBe('ana');

    await setSessionUser(null);
    await expect(getSessionUser()).resolves.toBeNull();
  });
});
