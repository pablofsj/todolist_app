import { expect, test } from '@playwright/test';

test('agrega, edita y elimina una tarea', async ({ page }) => {
  await page.goto('/');

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
