import { describe, expect, test } from 'vitest';

import { createUser, hashPassword, verifyUser } from './auth';

describe('auth', () => {
  test('crea un usuario con sal y hash, sin guardar la contraseña', async () => {
    const users = await createUser([], '  Ana ', 'secreto123');

    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('ana');
    expect(users[0].salt).toHaveLength(32);
    expect(users[0].hash).toHaveLength(64);
    expect(users[0].hash).not.toContain('secreto123');
  });

  test('genera hashes distintos para la misma contraseña con otra sal', async () => {
    expect(await hashPassword('secreto123', 'sal-a')).not.toBe(await hashPassword('secreto123', 'sal-b'));
  });

  test('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const users = await createUser([], 'ana', 'secreto123');

    await expect(verifyUser(users, 'ANA', 'secreto123')).resolves.toBe(true);
    await expect(verifyUser(users, 'ana', 'otra-clave')).resolves.toBe(false);
    await expect(verifyUser(users, 'nadie', 'secreto123')).resolves.toBe(false);
  });

  test('rechaza usuarios duplicados y credenciales demasiado cortas', async () => {
    const users = await createUser([], 'ana', 'secreto123');

    await expect(createUser(users, 'Ana', 'secreto123')).rejects.toThrow('ya existe');
    await expect(createUser(users, 'ab', 'secreto123')).rejects.toThrow('al menos 3');
    await expect(createUser(users, 'beto', '123')).rejects.toThrow('al menos 6');
  });
});
