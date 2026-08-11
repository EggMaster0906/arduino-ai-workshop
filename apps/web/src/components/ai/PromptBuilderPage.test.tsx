import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { arduinoAiIntroCourse, arduinoAiIntroPromptTasks } from '@arduino-ai/course-arduino-ai-intro'
import type { PromptTask } from '@arduino-ai/shared'
import { StudentProvider } from '../../hooks/useStudent'
import { createStudentState, saveStudentState } from '../../lib/storage'
import { PromptBuilderPage } from './PromptBuilderPage'

const taskFor = (id?: string): PromptTask => arduinoAiIntroPromptTasks.find((task) => task.id === id) ?? arduinoAiIntroPromptTasks[1]

describe('Prompt Builder', () => {
  beforeEach(() => {
    localStorage.clear()
    saveStudentState(createStudentState({ displayName: '小安', courseId: arduinoAiIntroCourse.id, firstLevelId: '2-2' }))
  })

  it('依 task query 載入對應任務，並使用真正的硬體 checkbox', () => {
    render(<StudentProvider><MemoryRouter initialEntries={['/prompt?task=servo-gate']}><Routes>
      <Route path="/prompt" element={<PromptBuilderPage course={arduinoAiIntroCourse} taskFor={taskFor} />} />
    </Routes></MemoryRouter></StudentProvider>)

    expect(screen.getByTestId('prompt-task-servo-gate')).toBeInTheDocument()
    const uno = screen.getByTestId('prompt-field-hardware-uno')
    expect(uno).toHaveAttribute('type', 'checkbox')
    fireEvent.click(uno)
    expect(uno).toBeChecked()
  })
})
