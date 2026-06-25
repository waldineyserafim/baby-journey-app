import { test, expect } from '@playwright/test'
import { url, login, requireCredentials } from './helpers'

test.describe('Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
    await page.goto(url('/reports'))
  })

  test('exibe página de relatórios', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /relatório/i })).toBeVisible({ timeout: 10000 })
  })

  test('exibe botão exportar CSV', async ({ page }) => {
    await expect(page.getByRole('button', { name: /exportar|csv/i })).toBeVisible()
  })

  test('exibe botão imprimir', async ({ page }) => {
    await expect(page.getByRole('button', { name: /imprimir/i })).toBeVisible()
  })

  test('exibe cards de estatísticas carregados', async ({ page }) => {
    await page.waitForTimeout(2000)
    const cards = page.locator('.card')
    await expect(cards.first()).toBeVisible()
  })
})
