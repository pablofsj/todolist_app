import { describe, expect, test } from 'vitest';

import { addTask, mergeTasks, removeTask, updateTask, type Task } from './tasks';

describe('task helpers', () => {
  test('adds a task on top and keeps the previous ones', () => {
    const tasks = addTask([], { title: 'Comprar café', description: 'Grano de especialidad' });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Comprar café',
      description: 'Grano de especialidad',
      createdAt: expect.any(Number),
    });

    const withTwo = addTask(tasks, { title: 'Estudiar', description: 'Unidad 1' });
    expect(withTwo.map((task) => task.title)).toEqual(['Estudiar', 'Comprar café']);
  });

  test('keeps photo and location when adding', () => {
    const [task] = addTask([], {
      title: 'Con periféricos',
      description: '',
      photo: 'data:image/png;base64,abc',
      location: { latitude: -33.45, longitude: -70.66 },
    });

    expect(task.photo).toBe('data:image/png;base64,abc');
    expect(task.location).toEqual({ latitude: -33.45, longitude: -70.66 });
  });

  test('updates only the matching task and preserves its extras', () => {
    const base: Task[] = [
      { id: 'a', title: 'Uno', description: '', createdAt: 1 },
      {
        id: 'b',
        title: 'Dos',
        description: '',
        createdAt: 2,
        photo: 'data:image/png;base64,abc',
        location: { latitude: 1, longitude: 2 },
      },
    ];

    const updated = updateTask(base, 'b', { title: 'Dos mejorada', description: 'Detalle' });
    expect(updated[1]).toEqual({
      ...base[1],
      title: 'Dos mejorada',
      description: 'Detalle',
    });
    expect(updated[0]).toBe(base[0]);
  });

  test('removes the matching task', () => {
    const base: Task[] = [
      { id: 'a', title: 'Uno', description: '', createdAt: 1 },
      { id: 'b', title: 'Dos', description: '', createdAt: 2 },
    ];

    expect(removeTask(base, 'a')).toEqual([base[1]]);
  });

  test('merges imported tasks without duplicating ids', () => {
    const current: Task[] = [
      { id: 'api-1', title: 'Repetida', description: '', createdAt: 1 },
      { id: 'local', title: 'Local', description: '', createdAt: 2 },
    ];
    const incoming: Task[] = [
      { id: 'api-1', title: 'Repetida', description: '', createdAt: 3 },
      { id: 'api-2', title: 'Nueva', description: '', createdAt: 4 },
    ];

    expect(mergeTasks(current, incoming).map((task) => task.id)).toEqual(['api-2', 'api-1', 'local']);
  });
});
