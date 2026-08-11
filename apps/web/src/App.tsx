import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { arduinoAiIntroCourse, arduinoAiIntroPromptTasks } from '@arduino-ai/course-arduino-ai-intro'
import { StudentProvider } from './hooks/useStudent'
import { HomePage } from './components/HomePage'
import { MainLayout } from './components/layout/MainLayout'
import { LessonPage } from './components/lesson/LessonPage'
import { PromptBuilderPage } from './components/ai/PromptBuilderPage'
import { PromptPreviewPage } from './components/ai/PromptPreviewPage'
import { CodingAiPage } from './components/ai/CodingAiPage'
import { DebugPage } from './components/ai/DebugPage'

export default function App() {
  const course = arduinoAiIntroCourse
  const task = (taskId?: string) => arduinoAiIntroPromptTasks.find((item) => item.id === taskId) ?? arduinoAiIntroPromptTasks.find((item) => item.id === 'servo-gate')!
  return <StudentProvider><HashRouter><Routes>
    <Route path="/" element={<HomePage course={course} />} />
    <Route element={<MainLayout course={course} />}>
      <Route path="/course/:courseId/level/:levelId" element={<LessonPage course={course} />} />
      <Route path="/prompt/:taskId?" element={<PromptBuilderPage course={course} taskFor={task} />} />
      <Route path="/preview/:taskId?" element={<PromptPreviewPage course={course} />} />
      <Route path="/coding/:taskId?" element={<CodingAiPage course={course} />} />
      <Route path="/debug/:taskId?" element={<DebugPage course={course} />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></HashRouter></StudentProvider>
}
