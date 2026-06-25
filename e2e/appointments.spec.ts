import { test, expect } from '@playwright/test'
import { url, login, requireCredentials } from './helpers'

test.describe('Consultas', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
    await page.goto(url('/appointments'))
    await expect(page.getByRole('heading', { name: /consultas/i })).toBeVisible()
  })

  test('exibe botão nova consulta', async ({ page }) => {
    await expect(page.getByRole('button', { name: /nova consulta/i })).toBeVisible()
  })

  test('abre modal de nova consulta', async ({ page }) => {
    await page.getByRole('button', { name: /nova consulta/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByPlaceholder(/obstetrícia|cardiologia|especialidade/i)).toBeVisible()
  })

  test('fecha modal ao cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /nova consulta/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('cria nova consulta e exibe na lista', async ({ page }) => {
    await page.getByRole('button', { name: /nova consulta/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const dateInput = page.locator('input[type="datetime-local"]').first()
    await dateInput.fill('2026-09-15T10:00')

    // Fill specialty field (first text input in form)
    const specialty = page.locator('.modal input[type="text"]').first()
    await specialty.fill('Obstetrícia Playwright')

    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/obstetrícia playwright/i)).toBeVisible({ timeout: 8000 })
  })
})
