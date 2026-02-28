import { useCallback, useRef, useEffect } from 'react'

/**
 * 語音播放 Hook（使用 Web Speech API）
 * 提供語音播放、自動播放語音說明等功能
 */
export function useSpeak() {
  const speakTimeoutRef = useRef(null)

  // 清理
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  /** 播放語音 */
  const speak = useCallback((text, lang = 'zh-TW') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.8
    utterance.pitch = 1.1
    window.speechSynthesis.speak(utterance)
  }, [])

  /** 播放中文語音 */
  const speakZh = useCallback((text) => speak(text, 'zh-TW'), [speak])

  /** 播放英文語音 */
  const speakEn = useCallback((text) => speak(text, 'en-US'), [speak])

  /** 延遲播放（用於進入關卡時的語音說明） */
  const speakDelayed = useCallback((text, lang = 'zh-TW', delay = 500) => {
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current)
    speakTimeoutRef.current = setTimeout(() => speak(text, lang), delay)
  }, [speak])

  /** 停止播放 */
  const stopSpeak = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current)
  }, [])

  return { speak, speakZh, speakEn, speakDelayed, stopSpeak }
}
