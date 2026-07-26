import { expect, test } from '@playwright/test'

test('public knowledge flow renders dynamic folder and document routes', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Damnatiox Knowledge' })).toBeVisible()
  await page
    .getByRole('link', { name: /Java 后端/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Java 后端' })).toBeVisible()
  await page
    .getByRole('link', { name: /Spring/ })
    .first()
    .click()
  await page
    .getByRole('link', { name: /Spring Boot/ })
    .first()
    .click()
  await page
    .getByRole('link', { name: /Spring Boot 简介/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: 'Spring Boot 简介' })).toBeVisible()
  await expect(page.getByText('知识库').first()).toBeVisible()
  await expect(page.getByText('Java 后端').first()).toBeVisible()
})

test('global search opens with keyboard shortcut and finds a document', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Control+K')
  await expect(page.getByRole('dialog', { name: '搜索知识库' })).toBeVisible()
  await page.getByLabel('搜索关键词').fill('chunking')
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /文档切分基础/ }),
  ).toBeVisible()
})

test('theme toggle switches to light mode and persists the preference', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: '切换到浅色模式' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('button', { name: '切换到深色模式' })).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/knowledge/java-backend/spring/spring-boot/spring-boot-introduction')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})
