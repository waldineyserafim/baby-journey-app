import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173/baby-journey-app'
const EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const PASSWORD = process.env.TEST_PASSWORD ?? 'password123'

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/login`)
  await page.getByLabel(/email/i).fill(EMAIL)
  await page.getByLabel(/senha/i).fill(PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await page.goto(`${BASE}/appointments`)
})

test.describe('Consultas', () => {
  test('exibe página de consultas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /consultas/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nova consulta/i })).toBeVisible()
  })

  test('abre modal de nova consulta', async ({ page }) => {
    await page.getByRole('button', { name: /nova consulta/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel(/especialidade/i)).toBeVisible()
  })

  test('cria nova consulta', async ({ page }) => {
    await page.getByRole('button', { name: /nova consulta/i }).click()
    await page.getByLabel(/especialidade/i).fill('Obstetrícia')
    await page.getByLabel(/médico/i).fill('Dr. Teste')
    const dateInput = page.locator('input[type="datetime-local"]').first()
    await dateInput.fill('2026-08-01T10:00')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText(/obstetrícia/i)).toBeVisible({ timeout: 5000 })
  })
})
