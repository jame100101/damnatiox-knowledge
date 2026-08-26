import { expect, test, type Page } from '@playwright/test'

type KnowledgeFixture = {
  navigation: Array<{ path: string; heading: string }>
  documentPath: string
  searchQuery: string
  searchResult: string
  lightFolderPath: string
  mermaidPath: string
  collapseFolder: string
  treeFolders: string[]
  treeDocument: string
  deepTocPath?: string
}

const demoFixture: KnowledgeFixture = {
  navigation: [
    { path: '/knowledge/java-backend', heading: 'Java 后端' },
    { path: '/knowledge/java-backend/spring', heading: 'Spring' },
    {
      path: '/knowledge/java-backend/spring/spring-boot',
      heading: 'Spring Boot',
    },
    {
      path: '/knowledge/java-backend/spring/spring-boot/spring-boot-introduction',
      heading: 'Spring Boot 简介',
    },
  ],
  documentPath: '/knowledge/java-backend/spring/spring-boot/spring-boot-introduction',
  searchQuery: 'chunking',
  searchResult: '文档切分基础',
  lightFolderPath: '/knowledge/java-backend',
  mermaidPath: '/knowledge/java-backend/spring/spring-boot/spring-boot-introduction',
  collapseFolder: 'Spring Boot',
  treeFolders: ['Spring', 'Spring Boot'],
  treeDocument: 'Spring Boot 简介',
}

const agentFixture: KnowledgeFixture = {
  navigation: [
    { path: '/knowledge/agent-development', heading: 'Agent开发' },
    {
      path: '/knowledge/agent-development/agent-basics',
      heading: 'Agent基础',
    },
    {
      path: '/knowledge/agent-development/agent-basics/swe-agent-basics-aci-1bhr0z7',
      heading: 'SWE Agent 基础概念与 ACI',
    },
  ],
  documentPath:
    '/knowledge/agent-development/agent-basics/swe-agent-basics-aci-1bhr0z7',
  searchQuery: 'SWE-bench',
  searchResult: 'SWE Agent 基础概念与 ACI',
  lightFolderPath: '/knowledge/agent-development',
  mermaidPath: '/knowledge/agent-development/agent-basics/swe-agent-basics-aci-1bhr0z7',
  collapseFolder: 'Agent基础',
  treeFolders: ['Agent基础'],
  treeDocument: 'SWE Agent 基础概念与 ACI',
  deepTocPath:
    '/knowledge/agent-development/modern-agent-12eureu/openai-codex-agent-loop-skills-context-harness-1txmyyk',
}

async function detectFixture(page: Page): Promise<KnowledgeFixture> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.folder-card').first()).toBeVisible()

  return (await page.locator('.demo-strip').isVisible()) ? demoFixture : agentFixture
}

test('public knowledge flow renders dynamic folder and document routes', async ({
  page,
}) => {
  const fixture = await detectFixture(page)
  await expect(page.getByRole('heading', { name: 'Damnatiox Knowledge' })).toBeVisible()

  for (const step of fixture.navigation) {
    const link = page.locator(`main a[href="${step.path}"]`).first()
    await expect(link).toBeVisible()
    await link.click()
    await expect(
      page.getByRole('heading', { name: step.heading, exact: true }).first(),
    ).toBeVisible()
  }

  expect(new URL(page.url()).pathname).toBe(fixture.documentPath)
  await expect(page.getByText('知识库').first()).toBeVisible()
})

test('TypeScript language foundations are published with detailed comparisons', async ({
  page,
}) => {
  const fixture = await detectFixture(page)
  if (fixture === demoFixture) {
    test.skip()
    return
  }

  const languageCard = page.locator('main .folder-card').filter({ hasText: '语言基础' })
  await expect(languageCard).toBeVisible()
  await languageCard.click()
  await expect(
    page.getByRole('heading', { name: '语言基础', exact: true }),
  ).toBeVisible()

  const basics = page.locator('.child-grid a').filter({ hasText: 'TypeScript语言基础' })
  const comparison = page
    .locator('.child-grid a')
    .filter({ hasText: 'TypeScript跨语言对照' })
  await expect(basics).toBeVisible()
  await expect(comparison).toBeVisible()

  await basics.click()
  await expect(
    page
      .locator('.document-list a')
      .filter({ hasText: '环境配置与第一个 TypeScript 项目' }),
  ).toBeVisible()
  await expect(
    page
      .locator('.document-list a')
      .filter({ hasText: '映射类型、条件类型、模板字面量类型与 infer' }),
  ).toBeVisible()

  await page
    .getByLabel('面包屑')
    .getByRole('link', { name: '语言基础', exact: true })
    .click()
  await comparison.click()
  await expect(
    page.locator('.document-list a').filter({ hasText: 'TypeScript 与 JavaScript' }),
  ).toBeVisible()
  await expect(
    page.locator('.document-list a').filter({ hasText: 'TypeScript 与 C++' }),
  ).toBeVisible()
})

test('global search opens with keyboard shortcut and finds a document', async ({
  page,
}) => {
  const fixture = await detectFixture(page)
  await page.keyboard.press('Control+K')
  await expect(page.getByRole('dialog', { name: '搜索知识库' })).toBeVisible()
  await page.getByLabel('搜索关键词').fill(fixture.searchQuery)
  await expect(
    page
      .getByRole('dialog')
      .locator('.search-results a')
      .filter({ hasText: fixture.searchResult })
      .first(),
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

test('home line art stays subtle and inverts without changing its composition', async ({
  page,
}) => {
  await page.goto('/')
  const asset = await page.evaluate(async () => {
    const response = await fetch('/images/knowledge-home-line-art.png')
    return {
      contentType: response.headers.get('content-type'),
      ok: response.ok,
    }
  })
  expect(asset.ok).toBe(true)
  expect(asset.contentType).toContain('image/png')

  const stage = page.locator('.home-stage')
  const themeToggle = page.locator('.theme-toggle')
  await expect(stage).toBeVisible()

  if ((await page.locator('html').getAttribute('data-theme')) === 'light') {
    await themeToggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  }

  const readArtStyle = () =>
    stage.evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return {
        backgroundImage: style.backgroundImage,
        backgroundPosition: style.backgroundPosition,
        backgroundSize: style.backgroundSize,
        filter: style.filter,
        mixBlendMode: style.mixBlendMode,
        opacity: Number(style.opacity),
        pointerEvents: style.pointerEvents,
      }
    })

  const dark = await readArtStyle()
  expect(dark.backgroundImage).toContain('knowledge-home-line-art.png')
  expect(dark.filter).toContain('invert(1)')
  expect(dark.mixBlendMode).toBe('screen')
  expect(dark.opacity).toBeGreaterThan(0)
  expect(dark.opacity).toBeLessThanOrEqual(0.1)
  expect(dark.pointerEvents).toBe('none')

  await themeToggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const light = await readArtStyle()
  expect(light.backgroundImage).toBe(dark.backgroundImage)
  expect(light.backgroundPosition).toBe(dark.backgroundPosition)
  expect(light.backgroundSize).toBe(dark.backgroundSize)
  expect(light.filter).toBe('none')
  expect(light.mixBlendMode).toBe('multiply')
  expect(light.opacity).toBeGreaterThan(0)
  expect(light.opacity).toBeLessThanOrEqual(0.1)
})

test('branding and light theme controls keep their intended visual tokens', async ({
  page,
}) => {
  const fixture = await detectFixture(page)
  await expect(page).toHaveTitle('Knowledge Base')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg')

  const favicon = await page.evaluate(async () => {
    const response = await fetch('/favicon.svg')
    return {
      body: await response.text(),
      contentType: response.headers.get('content-type'),
      status: response.status,
    }
  })
  expect(favicon.status).toBe(200)
  expect(favicon.contentType).toContain('image/svg+xml')
  expect(favicon.body).toContain('<svg')

  await page.getByRole('button', { name: '切换到浅色模式' }).click()
  await page.goto(fixture.lightFolderPath)
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

  await page.locator('.search-trigger').click()
  const searchDialog = page.getByRole('dialog', { name: '搜索知识库' })
  await expect(searchDialog).toBeVisible()
  const shortcutStyle = await searchDialog
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
  const fixture = await detectFixture(page)
  await page.goto(fixture.mermaidPath)
  const diagram = page.locator('.mermaid-interactive').first()
  const scrollViewport = diagram.locator('.mermaid-scroll-viewport')
  const openButton = page.locator('.mermaid-open-button').first()
  await expect(openButton).toBeVisible()
  await expect(scrollViewport).toBeVisible()

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

  // Some production font/rendering combinations make the fixture diagram fit
  // exactly inside the viewport. Force a deterministic overflow only for this
  // scroll-position assertion; the control's real layout styles remain intact.
  await scrollViewport.evaluate((element) => {
    const svg = element.querySelector('svg')
    if (svg && element.scrollWidth <= element.clientWidth) {
      svg.style.minWidth = `${element.clientWidth + 480}px`
      svg.style.maxWidth = 'none'
    }
  })

  await expect
    .poll(() =>
      scrollViewport.evaluate((element) => element.scrollWidth - element.clientWidth),
    )
    .toBeGreaterThan(0)
  const beforeScroll = await openButton.boundingBox()
  await scrollViewport.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  await expect
    .poll(() => scrollViewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  const afterScroll = await openButton.boundingBox()
  expect(beforeScroll).toBeTruthy()
  expect(afterScroll).toBeTruthy()
  expect(Math.abs(afterScroll!.x - beforeScroll!.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(afterScroll!.y - beforeScroll!.y)).toBeLessThanOrEqual(1)

  await openButton.click()
  const viewer = page.getByRole('dialog')
  await expect(viewer).toBeVisible()
  await expect(viewer.locator('.diagram-viewer-canvas svg')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(viewer).toBeHidden()
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
  const fixture = await detectFixture(page)
  await page.goto(fixture.navigation[0]!.path)
  await page.waitForLoadState('networkidle')

  for (const folder of fixture.treeFolders) {
    await page.locator('.tree-label').filter({ hasText: folder }).first().click()
  }
  await page
    .locator('.tree-document')
    .filter({ hasText: fixture.treeDocument })
    .first()
    .click()
  await expect(page.locator('.document-page')).toBeVisible()

  const folderRow = page
    .locator('.tree-label')
    .filter({ hasText: fixture.collapseFolder })
    .first()
    .locator('xpath=..')
  const childList = folderRow.locator('xpath=..').locator(':scope > ul.tree-children')
  await expect(childList).toBeVisible()
  await folderRow.locator('.tree-label').click()
  await expect(childList).toBeHidden()
  expect(new URL(page.url()).pathname).toBe(fixture.documentPath)

  await page.locator('.document-page').evaluate((element) => {
    element.style.minHeight = '2200px'
  })
  await page.evaluate(() => window.scrollTo(0, 900))
  const toc = await page.locator('.reader-grid > aside').boundingBox()
  expect(toc?.y).toBeCloseTo(24, 0)
})

test('sidebar document icons stay uniform after long titles and reading lists are flat', async ({
  page,
}) => {
  const fixture = await detectFixture(page)
  await page.goto(fixture.navigation[0]!.path)
  await page.waitForLoadState('networkidle')
  for (const folder of fixture.treeFolders) {
    await page.locator('.tree-label').filter({ hasText: folder }).first().click()
  }

  const icons = page.locator('.tree-document > svg:visible')
  await expect(icons.first()).toBeVisible()
  const metrics = await icons.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element)
      const bounds = element.getBoundingClientRect()
      return {
        width: bounds.width,
        height: bounds.height,
        minWidth: style.minWidth,
        flexBasis: style.flexBasis,
        flexShrink: style.flexShrink,
      }
    }),
  )

  for (const metric of metrics) {
    expect(metric.width).toBeCloseTo(13, 1)
    expect(metric.height).toBeCloseTo(13, 1)
    expect(metric.minWidth).toBe('13px')
    expect(metric.flexBasis).toBe('13px')
    expect(metric.flexShrink).toBe('0')
  }
  await expect(page.locator('.tree-label', { hasText: '推荐阅读' })).toHaveCount(0)
})

test('source-analysis TOC mirrors every rendered heading level', async ({ page }) => {
  const fixture = await detectFixture(page)
  if (!fixture.deepTocPath) {
    test.skip()
    return
  }
  await page.goto(fixture.deepTocPath)
  await page.waitForLoadState('networkidle')

  const renderedHeadings = await page
    .locator(
      '.markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6',
    )
    .evaluateAll((elements) => elements.map((element) => `#${element.id}`))
  const tocLinks = await page
    .locator('.toc nav a')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))

  expect(renderedHeadings.length).toBeGreaterThan(60)
  expect(tocLinks).toEqual(renderedHeadings)
  await expect(page.locator('.toc nav a.level-4')).toHaveCount(2)
  await expect(
    page.locator('.toc nav a', { hasText: 'Phase 1：从 rollout 提取候选' }),
  ).toBeVisible()
  await expect(
    page.locator('.toc nav a', { hasText: 'Phase 2：全局整合' }),
  ).toBeVisible()
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const fixture = await detectFixture(page)
  await page.goto(fixture.documentPath)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})
