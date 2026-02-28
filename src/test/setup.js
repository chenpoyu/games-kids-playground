import '@testing-library/jest-dom'

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running'
  }
  resume() { return Promise.resolve() }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: {
        value: 0,
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }
  }
  get currentTime() { return 0 }
  get destination() { return {} }
}

window.AudioContext = MockAudioContext
window.webkitAudioContext = MockAudioContext

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))
