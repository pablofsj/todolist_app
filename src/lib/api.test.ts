import { describe, expect, test, vi } from 'vitest';

import { API_URL, importTasks, syncTasks } from './api';
import type { Task } from './tasks';

const reply = (body: unknown, ok = true, status = 200) => ({ ok, status, json: async () => body }) as Response;

describe('api', () => {
  test('importa y normaliza las tareas de la API', async () => {
    const fetchMock = vi.fn(async () =>
      reply([
        { id: 1, title: 'delectus aut autem', completed: false },
        { id: 2, title: 'quis ut nam facilis', completed: true },
        { id: 'invalida', title: null },
      ]),
    );

    const tasks = await importTasks(fetchMock as unknown as typeof fetch, 3);

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/todos?_limit=3`);
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({ id: 'api-1', title: 'delectus aut autem' });
    expect(tasks[1].description).toContain('completada');
  });

  test('falla si la API responde con error', async () => {
    const fetchMock = vi.fn(async () => reply({}, false, 503));

    await expect(importTasks(fetchMock as unknown as typeof fetch)).rejects.toThrow('503');
  });

  test('falla si la API devuelve un formato inesperado', async () => {
    const fetchMock = vi.fn(async () => reply({ items: [] }));

    await expect(importTasks(fetchMock as unknown as typeof fetch)).rejects.toThrow('formato inválido');
  });

  test('sincroniza cada tarea con un POST y cuenta las enviadas', async () => {
    const fetchMock = vi.fn(async () => reply({ id: 201 }, true, 201));
    const tasks: Task[] = [
      { id: 'a', title: 'Una', description: 'A', createdAt: 1 },
      { id: 'b', title: 'Dos', description: 'B', createdAt: 2 },
    ];

    await expect(syncTasks(tasks, fetchMock as unknown as typeof fetch)).resolves.toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/todos`, expect.objectContaining({ method: 'POST' }));
  });

  test('corta la sincronización si una tarea falla', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(reply({}, true, 201))
      .mockResolvedValueOnce(reply({}, false, 500));
    const tasks: Task[] = [
      { id: 'a', title: 'Una', description: '', createdAt: 1 },
      { id: 'b', title: 'Dos', description: '', createdAt: 2 },
    ];

    await expect(syncTasks(tasks, fetchMock as unknown as typeof fetch)).rejects.toThrow('"Dos"');
  });
});
