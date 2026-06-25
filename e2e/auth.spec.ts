import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173/baby-journey-app'
const EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const PASSWORD = process.env.TEST_PASSWORD ?? 'password123'

test.describe('Autenticação', () => {
  test('exibe página de login', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByRole('heading', { name: /baby journey/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('login com email e senha válidos', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel(/email/i).fill(EMAIL)
    await page.getByLabel(/senha/i).fill(PASSWORD)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel(/email/i).fill('invalido@teste.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 })
  })

  test('logout redireciona para login', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel(/email/i).fill(EMAIL)
    await page.getByLabel(/senha/i).fill(PASSWORD)
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.getByTitle('Sair').click()
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
