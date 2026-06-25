import { test, expect } from '@playwright/test'
import { url, login, requireCredentials } from './helpers'

test.describe('Notificações', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
    await page.goto(url('/notifications'))
  })

  test('exibe página de notificações', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /notificações/i })).toBeVisible()
  })

  test('exibe filtros de status', async ({ page }) => {
    await expect(page.getByRole('button', { name: /todas/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /não lidas/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /lidas/i })).toBeVisible()
  })

  test('abre e fecha modal de nova notificação', async ({ page }) => {
    await page.getByRole('button', { name: /nova notificação|criar/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
