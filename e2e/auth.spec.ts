import { test, expect } from '@playwright/test'
import { url, login, EMAIL, PASSWORD, requireCredentials } from './helpers'

test.describe('Autenticação', () => {
  test('exibe página de login', async ({ page }) => {
    await page.goto(url('/login'))
    await expect(page.getByRole('heading', { name: /baby journey/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('exibe link para criar conta', async ({ page }) => {
    await page.goto(url('/login'))
    await expect(page.getByRole('link', { name: /criar conta/i })).toBeVisible({ timeout: 10000 })
  })

  test('campo email tem validação de formato', async ({ page }) => {
    await page.goto(url('/login'))
    const emailInput = page.getByLabel('Email')
    // Browser-level HTML5 email validation — check native validity
    await emailInput.fill('email-invalido')
    const valid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(valid).toBe(false)
  })

  test('exibe erro de validação de senha curta', async ({ page }) => {
    await page.goto(url('/login'))
    await page.getByLabel('Email').fill('teste@email.com')
    await page.getByLabel('Senha').fill('123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/mínimo 6/i)).toBeVisible({ timeout: 5000 })
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    test.skip(!requireCredentials(), 'Requer TEST_EMAIL e TEST_PASSWORD')
    await page.goto(url('/login'))
    await page.getByLabel('Email').fill('invalido@teste.com')
    await page.getByLabel('Senha').fill('senhaerrada123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 10000 })
  })

  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    test.skip(!requireCredentials(), 'Requer TEST_EMAIL e TEST_PASSWORD')
    await login(page, EMAIL, PASSWORD)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout redireciona para login', async ({ page }) => {
    test.skip(!requireCredentials(), 'Requer TEST_EMAIL e TEST_PASSWORD')
    await login(page, EMAIL, PASSWORD)
    const vp = page.viewportSize()?.width ?? 1280
    if (vp < 768) {
      await page.getByRole('button', { name: /mais/i }).click()
      await page.getByRole('button', { name: /sair/i }).click()
    } else {
      await page.getByTitle('Sair').click()
    }
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
