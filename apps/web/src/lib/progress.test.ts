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

  it('線性解鎖只允許前一關完成後進入下一關，並正確計算總進度', () => {
    const state = createStudentState({ displayName: '小安', courseId: arduinoAiIntroCourse.id, firstLevelId: '1-0' })
    expect(canOpenLevel(arduinoAiIntroCourse, state, '1-1')).toBe(false)
    state.completedLevels = ['1-0']
    expect(canOpenLevel(arduinoAiIntroCourse, state, '1-1')).toBe(true)
    expect(getProgress(arduinoAiIntroCourse, state)).toEqual({ completed: 1, total: 16, percentage: 6 })
  })
})
