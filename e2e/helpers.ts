import { Page } from '@playwright/test'

export const APP = '/baby-journey-app'
export const EMAIL = process.env.TEST_EMAIL ?? ''
export const PASSWORD = process.env.TEST_PASSWORD ?? ''

/** Skip the test if no real credentials are configured */
export function requireCredentials() {
  if (!EMAIL || !PASSWORD) {
    // eslint-disable-next-line no-console
    console.log('Skipping: set TEST_EMAIL and TEST_PASSWORD env vars to run auth-required tests')
    return false
  }
  return true
}

/** Navigate to a route within the app (prefixes with basename) */
export function url(path: string) {
  return `${APP}${path}`
}

/** Login and wait for dashboard. Throws if credentials not set. */
export async function login(page: Page, email = EMAIL, password = PASSWORD) {
  if (!email || !password) throw new Error('TEST_EMAIL and TEST_PASSWORD must be set')
  await page.goto(url('/login'))
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20000 })
}

/** True when running on mobile viewport */
export function isMobileViewport(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 768
}
