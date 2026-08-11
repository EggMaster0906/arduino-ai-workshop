import { describe, expect, it } from 'vitest'
import { arduinoAiIntroCourse } from '@arduino-ai/course-arduino-ai-intro'
import { createStudentState } from './storage'
import { canCompleteLevel, canOpenLevel, getProgress } from './progress'

describe('關卡進度規則', () => {
  it('必答題與實作確認都完成後才能完成含硬體任務的關卡', () => {
    const level = arduinoAiIntroCourse.chapters[0].levels.find((item) => item.id === '1-1')!
    const state = createStudentState({ displayName: '小安', courseId: arduinoAiIntroCourse.id, firstLevelId: '1-1' })
    state.answers['1-1-delay'] = 'faster'

    expect(canCompleteLevel(level, state)).toBe(false)
    state.hardwareConfirmations['1-1'] = true
    expect(canCompleteLevel(level, state)).toBe(true)
  })

  it('測試模式可直接開啟所有關卡，並正確計算總進度', () => {
    const state = createStudentState({ displayName: '小安', courseId: arduinoAiIntroCourse.id, firstLevelId: '1-0' })
    expect(canOpenLevel(arduinoAiIntroCourse, state, '1-1')).toBe(true)
    state.completedLevels = ['1-0']
    expect(canOpenLevel(arduinoAiIntroCourse, state, '1-1')).toBe(true)
    expect(getProgress(arduinoAiIntroCourse, state)).toEqual({ completed: 1, total: 16, percentage: 6 })
  })

  it('2-2 與 2-3 答對必答題後可直接前往下一關', () => {
    const state = createStudentState({ displayName: '小安', courseId: arduinoAiIntroCourse.id, firstLevelId: '2-2' })
    const level22 = arduinoAiIntroCourse.chapters[1].levels.find((item) => item.id === '2-2')!
    const level23 = arduinoAiIntroCourse.chapters[1].levels.find((item) => item.id === '2-3')!

    state.answers['2-2-logic'] = 'logic'
    expect(canCompleteLevel(level22, state)).toBe(true)

    state.answers['2-3-role'] = 'ask'
    expect(canCompleteLevel(level23, state)).toBe(true)
  })
})
