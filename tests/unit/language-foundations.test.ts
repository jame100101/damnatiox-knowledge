import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(full)
    return /\.md$/i.test(entry.name) ? [full] : []
  })
}

describe('TypeScript language foundations content', () => {
  const root = path.resolve(process.cwd(), 'content', '语言基础')
  const files = markdownFiles(root)
  const sources = files.map((file) => fs.readFileSync(file, 'utf8'))
  const combined = sources.join('\n')

  it('contains the complete TypeScript curriculum and cross-language set', () => {
    expect(files).toHaveLength(25)
    expect(
      files.filter((file) =>
        file.includes(`${path.sep}01-TypeScript语言基础${path.sep}`),
      ),
    ).toHaveLength(18)
    expect(
      files.filter((file) =>
        file.includes(`${path.sep}02-TypeScript跨语言对照${path.sep}`),
      ),
    ).toHaveLength(6)
  })

  it('keeps every article substantial and structurally valid', () => {
    for (const source of sources) {
      expect(source.match(/^#\s+.+$/gm)).toHaveLength(1)
      expect((source.match(/^##\s+.+$/gm) || []).length).toBeGreaterThanOrEqual(2)
      expect((source.match(/^```/gm) || []).length % 2).toBe(0)
      expect(source.length).toBeGreaterThan(2500)
    }
  })

  it('includes executable-style examples, official sources and comparison coverage', () => {
    expect(
      (combined.match(/^```typescript(?:\s|$)/gm) || []).length,
    ).toBeGreaterThanOrEqual(45)
    expect(
      (combined.match(/https:\/\/www\.typescriptlang\.org\//g) || []).length,
    ).toBeGreaterThanOrEqual(30)
    for (const language of ['JavaScript', 'Java', 'Python', 'C++']) {
      expect(combined).toContain(language)
    }
    for (const boundary of ['类型擦除', '运行时验证', '结构化', 'RAII', '模板实例化']) {
      expect(combined).toContain(boundary)
    }
  })
})
