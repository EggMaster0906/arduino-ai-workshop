import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { arduinoAiIntroCourse } from '@arduino-ai/course-arduino-ai-intro'
import { HomePage } from './HomePage'
import { StudentProvider } from '../hooks/useStudent'
import { loadStudentState } from '../lib/storage'

describe('首頁匿名 Session', () => {
  beforeEach(() => localStorage.clear())

  it('輸入暱稱後建立本機 Session 並前往第一關', () => {
    render(<StudentProvider><MemoryRouter initialEntries={['/']}><Routes>
      <Route path="/" element={<HomePage course={arduinoAiIntroCourse} />} />
      <Route path="/course/:courseId/level/:levelId" element={<p>已進入第一關</p>} />
    </Routes></MemoryRouter></StudentProvider>)

    fireEvent.change(screen.getByTestId('student-display-name'), { target: { value: '測試同學' } })
    fireEvent.click(screen.getByTestId('course-start'))

    expect(screen.getByText('已進入第一關')).toBeInTheDocument()
    expect(loadStudentState()).toMatchObject({ student: { displayName: '測試同學' }, currentLevelId: '1-0' })
  })
})
