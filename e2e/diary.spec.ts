import { test, expect } from '@playwright/test'
import { url, login, requireCredentials } from './helpers'

test.describe('Diário', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
    await page.goto(url('/diary'))
  })

  test('exibe página do diário', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /diário/i })).toBeVisible()
  })

  test('exibe botão para nova entrada', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /nova entrada|novo registro|adicionar/i })
    ).toBeVisible()
  })

  test('abre e fecha modal', async ({ page }) => {
    await page.getByRole('button', { name: /nova entrada|novo registro|adicionar/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
