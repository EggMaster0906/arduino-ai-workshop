import { beforeEach, describe, expect, it } from 'vitest'
import { STUDENT_STORAGE_KEY, createStudentState, loadStudentState, saveStudentState } from './storage'

describe('本機學習紀錄', () => {
  beforeEach(() => localStorage.clear())

  it('建立匿名 Session，並在重新載入時保留學生與進度資料', () => {
    const state = createStudentState({
      displayName: '小安',
      studentCode: '07',
      group: '801',
      courseId: 'arduino-ai-intro',
      firstLevelId: '1-0',
    })
    saveStudentState({
      ...state,
      completedLevels: ['1-0'],
      answers: { '1-0-ipo': 'output' },
    })

    expect(loadStudentState()).toMatchObject({
      student: { displayName: '小安', studentCode: '07', group: '801' },
      completedLevels: ['1-0'],
      answers: { '1-0-ipo': 'output' },
      completedActivities: [],
    })
  })

  it('為舊資料補上 completedActivities，避免 schema 擴充後直接遺失進度', () => {
    const current = createStudentState({ displayName: '小安', courseId: 'arduino-ai-intro', firstLevelId: '1-0' })
    const legacy = { ...current } as Record<string, unknown>
    delete legacy.completedActivities
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(legacy))

    expect(loadStudentState()?.completedActivities).toEqual([])
  })
})
