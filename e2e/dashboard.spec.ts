import { test, expect } from '@playwright/test'
import { url, login, isMobileViewport, requireCredentials } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    if (!requireCredentials()) return test.skip()
    await login(page)
  })

  test('exibe semana gestacional', async ({ page }) => {
    await expect(page.getByText(/semana/i).first()).toBeVisible()
  })

  test('exibe cards de resumo', async ({ page }) => {
    const cards = page.locator('.card')
    await expect(cards.first()).toBeVisible()
  })

  test('desktop: sidebar tem links principais', async ({ page }) => {
    if (isMobileViewport(page)) return test.skip()
    await expect(page.getByRole('link', { name: /consultas/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /diário/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /exames/i }).first()).toBeVisible()
  })

  test('mobile: bottom nav exibe itens principais', async ({ page }) => {
    if (!isMobileViewport(page)) return test.skip()
    await expect(page.getByRole('link', { name: /início/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /consultas/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /diário/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /fotos/i })).toBeVisible()
  })

  test('mobile: botão Mais abre menu completo', async ({ page }) => {
    if (!isMobileViewport(page)) return test.skip()
    await page.getByRole('button', { name: /mais/i }).click()
    await expect(page.getByText('Menu')).toBeVisible()
    await expect(page.getByRole('link', { name: /exames/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /vacinas/i })).toBeVisible()
    await page.getByRole('button').filter({ hasText: '' }).first().click() // close button
  })

  test('navega para consultas', async ({ page }) => {
    await page.getByRole('link', { name: /consultas/i }).first().click()
    await expect(page).toHaveURL(/\/appointments/)
    await expect(page.getByRole('heading', { name: /consultas/i })).toBeVisible()
  })

  test('navega para diário', async ({ page }) => {
    await page.getByRole('link', { name: /diário/i }).first().click()
    await expect(page).toHaveURL(/\/diary/)
  })

  test('navega para fotos', async ({ page }) => {
    const mobile = isMobileViewport(page)
    if (mobile) {
      await page.getByRole('link', { name: /fotos/i }).click()
    } else {
      await page.getByRole('link', { name: /fotos/i }).first().click()
    }
    await expect(page).toHaveURL(/\/photos/)
  })
})
