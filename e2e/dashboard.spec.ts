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
})

test.describe('Dashboard', () => {
  test('exibe semana gestacional', async ({ page }) => {
    await expect(page.getByText(/semana/i).first()).toBeVisible()
  })

  test('sidebar tem links principais', async ({ page }) => {
    await expect(page.getByRole('link', { name: /consultas/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /exames/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /diário/i })).toBeVisible()
  })

  test('navega para consultas', async ({ page }) => {
    await page.getByRole('link', { name: /consultas/i }).click()
    await expect(page).toHaveURL(/\/appointments/)
    await expect(page.getByRole('heading', { name: /consultas/i })).toBeVisible()
  })

  test('navega para fotos', async ({ page }) => {
    await page.getByRole('link', { name: /fotos/i }).click()
    await expect(page).toHaveURL(/\/photos/)
    await expect(page.getByRole('heading', { name: /álbum/i })).toBeVisible()
  })
})
