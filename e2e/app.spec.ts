import { expect, test, type Page } from '@playwright/test';

const register = async (page: Page, user = 'eva2') => {
  await page.goto('/');

  await page.locator('.login-form ion-input input').nth(0).fill(user);
  await page.locator('.login-form ion-input input').nth(1).fill('secreto123');
  await page.getByRole('button', { name: 'Crear una cuenta nueva' }).click();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page.locator('.task-form')).toBeVisible();
};

test('registro, tareas, periféricos y persistencia', async ({ page }) => {
  await register(page);

  await page.locator('.task-form ion-input input').fill('Comprar café');
  await page.locator('.task-form ion-textarea textarea').fill('Grano de especialidad');

  const fileChooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Adjuntar foto' }).click();
  await (await fileChooser).setFiles('docs/screenshots/eva2/foto-ejemplo.jpg');
  await expect(page.locator('.photo-preview')).toBeVisible();

  await page.locator('.primary-btn').click();

  const item = page.locator('.task-item').first();
  await expect(item).toContainText('Comprar café');
  await expect(item.locator('.task-photo')).toBeVisible();
  await expect(item.locator('.task-location')).toContainText('-33.4489');

  await page.reload();
  await expect(page.locator('.task-item').first()).toContainText('Comprar café');
});

test('edita y elimina una tarea', async ({ page }) => {
  await register(page, 'editor');

  const title = page.locator('.task-form ion-input input');
  const description = page.locator('.task-form ion-textarea textarea');

  await title.fill('Comprar café');
  await description.fill('Grano de especialidad');
  await page.locator('.primary-btn').click();

  const item = page.locator('.task-item').first();
  await expect(item).toContainText('Comprar café');
  await expect(item).toContainText('Grano de especialidad');
  await expect(title).toHaveValue('');

  await page.getByRole('button', { name: 'Editar Comprar café' }).click();
  await expect(page.locator('.primary-btn')).toContainText('Guardar cambios');
  await title.fill('Comprar té');
  await page.locator('.primary-btn').click();
  await expect(item).toContainText('Comprar té');

  await page.getByRole('button', { name: 'Eliminar Comprar té' }).click();
  await expect(page.locator('.task-item')).toHaveCount(0);
  await expect(page.locator('.empty-state')).toBeVisible();
});

test('importa y sincroniza tareas con la API', async ({ page }) => {
  await page.route('**/todos?_limit=5', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, title: 'delectus aut autem', completed: false },
        { id: 2, title: 'quis ut nam facilis', completed: true },
      ]),
    }),
  );
  await page.route('**/todos', (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"id":1}' }),
  );

  await register(page, 'api');

  await page.getByRole('button', { name: 'Importar desde API' }).click();
  await expect(page.locator('.task-item')).toHaveCount(2);
  await expect(page.locator('.task-item').first()).toContainText('delectus aut autem');

  await page.getByRole('button', { name: 'Sincronizar' }).click();
  await expect(page.locator('ion-toast')).toHaveAttribute('message', '2 tareas sincronizadas con la API.');
});
