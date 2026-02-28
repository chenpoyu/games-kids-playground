import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSound } from '../../hooks/useSound'

describe('useSound', () => {
  it('returns all sound functions', () => {
    const { result } = renderHook(() => useSound())
    expect(result.current.playCorrect).toBeTypeOf('function')
    expect(result.current.playWrong).toBeTypeOf('function')
    expect(result.current.playClick).toBeTypeOf('function')
    expect(result.current.playWin).toBeTypeOf('function')
    expect(result.current.playPop).toBeTypeOf('function')
  })

  it('playClick does not throw', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playClick()).not.toThrow()
  })

  it('playCorrect does not throw', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playCorrect()).not.toThrow()
  })

  it('playWrong does not throw', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playWrong()).not.toThrow()
  })

  it('playWin does not throw', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playWin()).not.toThrow()
  })

  it('playPop does not throw', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playPop()).not.toThrow()
  })
})
