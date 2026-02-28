import { useCallback } from 'react'

/**
 * 播放簡單音效（使用 Web Audio API）
 * 避免載入音檔，直接生成音效
 */
export function useSound() {
  const audioCtx = typeof window !== 'undefined' 
    ? new (window.AudioContext || window.webkitAudioContext)() 
    : null

  const playTone = useCallback((frequency, duration = 0.15, type = 'sine', volume = 0.3) => {
    if (!audioCtx) return
    // 確保 AudioContext 已啟動
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  }, [audioCtx])

  const playCorrect = useCallback(() => {
    playTone(523, 0.1)  // C5
    setTimeout(() => playTone(659, 0.1), 100)  // E5
    setTimeout(() => playTone(784, 0.2), 200)  // G5
  }, [playTone])

  const playWrong = useCallback(() => {
    playTone(200, 0.3, 'square', 0.15)
  }, [playTone])

  const playClick = useCallback(() => {
    playTone(440, 0.08)
  }, [playTone])

  const playWin = useCallback(() => {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.15, 'sine', 0.2), i * 100)
    })
  }, [playTone])

  const playPop = useCallback(() => {
    playTone(600 + Math.random() * 400, 0.12, 'sine', 0.25)
  }, [playTone])

  return { playCorrect, playWrong, playClick, playWin, playPop }
}
