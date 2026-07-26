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

test('branding and light theme controls keep their intended visual tokens', async ({
  page,
  request,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Knowledge Base')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg')

  const favicon = await request.get('/favicon.svg')
  expect(favicon.ok()).toBe(true)
  expect(favicon.headers()['content-type']).toContain('image/svg+xml')
  expect(await favicon.text()).toContain('<svg')

  await page.getByRole('button', { name: '切换到浅色模式' }).click()
  await page.goto('/knowledge/java-backend')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  const lightTokens = await page.evaluate(() => {
    const probe = document.createElement('span')
    document.body.append(probe)
    const resolveColor = (variable: string) => {
      probe.style.color = `var(${variable})`
      return getComputedStyle(probe).color
    }
    const tokens = {
      codeBackground: resolveColor('--kb-code-bg'),
      iconBackground: resolveColor('--kb-icon-tile-bg'),
      iconBorder: resolveColor('--kb-icon-tile-border'),
      shortcutBackground: resolveColor('--kb-shortcut-bg'),
      shortcutText: resolveColor('--kb-shortcut-text'),
    }
    probe.remove()
    return tokens
  })
  const miniFolderStyle = await page
    .locator('.mini-folder')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        border: style.borderColor,
      }
    })
  expect(miniFolderStyle.background).toBe(lightTokens.iconBackground)
  expect(miniFolderStyle.background).not.toBe(lightTokens.codeBackground)
  expect(miniFolderStyle.border).toBe(lightTokens.iconBorder)

  await page.keyboard.press('Control+K')
  const shortcutStyle = await page
    .getByRole('dialog', { name: '搜索知识库' })
    .locator('footer kbd')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        color: style.color,
      }
    })
  expect(shortcutStyle.background).toBe(lightTokens.shortcutBackground)
  expect(shortcutStyle.background).not.toBe(lightTokens.codeBackground)
  expect(shortcutStyle.color).toBe(lightTokens.shortcutText)
})

test('Mermaid enlarge control stays compact without inheriting diagram SVG width', async ({
  page,
}) => {
  await page.goto('/knowledge/java-backend/spring/spring-boot/spring-boot-introduction')
  const openButton = page.locator('.mermaid-open-button')
  await expect(openButton).toBeVisible()

  const metrics = await openButton.evaluate((element) => {
    const buttonStyle = getComputedStyle(element)
    const icon = element.querySelector('svg')
    const iconStyle = icon ? getComputedStyle(icon) : null
    const bounds = element.getBoundingClientRect()
    return {
      height: bounds.height,
      width: bounds.width,
      lineHeight: buttonStyle.lineHeight,
      overflowWrap: buttonStyle.overflowWrap,
      whiteSpace: buttonStyle.whiteSpace,
      iconMinWidth: iconStyle?.minWidth,
      iconWidth: iconStyle?.width,
    }
  })

  expect(metrics.height).toBeLessThanOrEqual(32)
  expect(metrics.width).toBeLessThan(100)
  expect(metrics.lineHeight).toBe('11px')
  expect(metrics.overflowWrap).toBe('normal')
  expect(metrics.whiteSpace).toBe('nowrap')
  expect(metrics.iconMinWidth).toBe('13px')
  expect(metrics.iconWidth).toBe('13px')
})

test('language selector switches public UI between all supported locales', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const selector = page.locator('.language-trigger')
  await selector.click()
  await page.getByRole('option', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.search-trigger span')).toHaveText('Search knowledge base')

  await selector.click()
  await page.getByRole('option', { name: '繁體中文（台灣）' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW')
  await expect(page.locator('.search-trigger span')).toHaveText('搜尋知識庫')
})

test('folder labels collapse the current folder and the TOC remains sticky', async ({
  page,
}) => {
  await page.goto('/knowledge/java-backend')
  await page.waitForLoadState('networkidle')
  await page.locator('.tree-label').filter({ hasText: 'Spring' }).click()
  await page.locator('.tree-label').filter({ hasText: 'Spring Boot' }).click()
  await page.locator('.tree-document').filter({ hasText: 'Spring Boot 简介' }).click()
  await expect(page).toHaveURL(
    /\/knowledge\/java-backend\/spring\/spring-boot\/spring-boot-introduction$/,
  )

  const folderRow = page.locator('.tree-row').filter({ hasText: 'Spring Boot' }).first()
  const childList = folderRow.locator('xpath=..').locator(':scope > ul.tree-children')
  await expect(childList).toBeVisible()
  await folderRow.locator('.tree-label').click()
  await expect(childList).toBeHidden()
  await expect(page).toHaveURL(
    /\/knowledge\/java-backend\/spring\/spring-boot\/spring-boot-introduction$/,
  )

  await page.locator('.document-page').evaluate((element) => {
    element.style.minHeight = '2200px'
  })
  await page.evaluate(() => window.scrollTo(0, 900))
  const toc = await page.locator('.reader-grid > aside').boundingBox()
  expect(toc?.y).toBeCloseTo(24, 0)
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/knowledge/java-backend/spring/spring-boot/spring-boot-introduction')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})
