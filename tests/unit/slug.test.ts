import { describe, expect, it } from 'vitest'
import { isSafeMarkdownFilename, sanitizeFilename, slugify } from '~/utils/slug'

describe('slug and filename utilities', () => {
  it('generates stable slugs for mixed Chinese and English titles', () => {
    expect(slugify('Java 后端 / Spring Boot')).toBe('java-backend-spring-boot')
    expect(slugify('  Tool Calling: Basics  ')).toBe('tool-calling-basics')
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
