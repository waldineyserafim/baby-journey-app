import { test, expect } from '@playwright/test'
import { url, login, requireCredentials } from './helpers'

test.describe('Enxoval', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
    await page.goto(url('/layette'))
  })

  test('exibe página do enxoval', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /enxoval/i })).toBeVisible()
  })

  test('exibe botão para adicionar item', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /adicionar|novo item/i })
    ).toBeVisible()
  })

  test('abre e fecha modal de novo item', async ({ page }) => {
    await page.getByRole('button', { name: /adicionar|novo item/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
