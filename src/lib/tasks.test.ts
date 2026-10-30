import { describe, expect, test } from 'vitest';

import { addTask, removeTask, updateTask, type Task } from './tasks';

describe('task helpers', () => {
  test('adds a task on top and keeps the previous ones', () => {
    const tasks = addTask([], 'Comprar café', 'Grano de especialidad');

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ title: 'Comprar café', description: 'Grano de especialidad' });

    const withTwo = addTask(tasks, 'Estudiar', 'Unidad 1');
    expect(withTwo.map((task) => task.title)).toEqual(['Estudiar', 'Comprar café']);
  });

  test('updates only the matching task', () => {
    const base: Task[] = [
      { id: 'a', title: 'Uno', description: '' },
      { id: 'b', title: 'Dos', description: '' },
    ];

    const updated = updateTask(base, 'b', 'Dos mejorada', 'Detalle');
    expect(updated[1]).toEqual({ id: 'b', title: 'Dos mejorada', description: 'Detalle' });
    expect(updated[0]).toBe(base[0]);
  });

  test('removes the matching task', () => {
    const base: Task[] = [
      { id: 'a', title: 'Uno', description: '' },
      { id: 'b', title: 'Dos', description: '' },
    ];

    expect(removeTask(base, 'a')).toEqual([base[1]]);
  });
});
