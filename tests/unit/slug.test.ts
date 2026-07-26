import { describe, expect, it } from 'vitest'
import { isSafeMarkdownFilename, sanitizeFilename, slugify } from '~/utils/slug'

describe('slug and filename utilities', () => {
  it('generates stable slugs for mixed Chinese and English titles', () => {
    expect(slugify('Java 后端 / Spring Boot')).toBe('java-backend-spring-boot')
    expect(slugify('  Tool Calling: Basics  ')).toBe('tool-calling-basics')
  })

  it('keeps arbitrary Chinese folder names compatible with database checks', () => {
    const first = slugify('推荐阅读')
    const second = slugify('完全自定义文件夹')

    expect(first).toBe('recommended-reading')
    expect(second).toMatch(/^item-[a-z0-9]+$/)
    expect(second).toBe(slugify('完全自定义文件夹'))
    expect(second).not.toBe(slugify('另一个自定义文件夹'))
    expect(first).toMatch(/^[a-z0-9][a-z0-9-]{0,119}$/)
    expect(second).toMatch(/^[a-z0-9][a-z0-9-]{0,119}$/)
  })

  it('retains useful English text and hashes untranslated characters', () => {
    const slug = slugify('Agent未知主题')
    expect(slug).toMatch(/^agent-[a-z0-9]+$/)
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]{0,119}$/)
  })

  it('caps long slugs at the folder limit', () => {
    const slug = slugify(`${'long title '.repeat(30)}中文`)
    expect(slug.length).toBeLessThanOrEqual(120)
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]{0,119}$/)
  })

  it('never emits empty separators', () => {
    expect(slugify('---Hello---World---')).toBe('hello-world')
  })

  it('sanitizes traversal and unsafe filename characters', () => {
    expect(sanitizeFilename('../draft<1>.md')).toBe('draft-1-.md')
    expect(isSafeMarkdownFilename('../secret.md')).toBe(false)
    expect(isSafeMarkdownFilename('notes.md')).toBe(true)
    expect(isSafeMarkdownFilename('notes.exe')).toBe(false)
  })
})
