import { Navigate, useNavigate } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { StartCourseForm } from './session/StartCourseForm'
import { getLevels } from '../lib/progress'
import { useStudent } from '../hooks/useStudent'

export function HomePage({ course }: { course: Course }) {
  const { state, start } = useStudent()
  const navigate = useNavigate()
  if (state) return <Navigate to={`/course/${course.id}/level/${state.currentLevelId}`} replace />
  const firstLevelId = getLevels(course)[0]?.id
  if (!firstLevelId) return <main className="home-page"><p>目前沒有可用的課程內容。</p></main>
  return <main className="home-page">
    <section className="hero">
      <div><p className="eyebrow">120 分鐘實作體驗課</p><h1>Arduino <span>×</span><br />生成式 AI</h1><p className="hero-copy">先看懂程式如何控制硬體，再把需求整理成清楚的 Prompt，與 AI 一起完成真正能測試的作品。</p><div className="hero-tags"><span>Arduino UNO</span><span>光敏電阻</span><span>SG90 Servo</span></div></div>
      <div className="hero-flow" aria-label="學習流程"><span>看懂程式</span><b>→</b><span>實作驗證</span><b>→</b><span>AI 協作</span><b>→</b><span>測試 Debug</span></div>
    </section>
    <section className="home-grid">
      <div className="course-overview"><h2>這堂課會完成什麼？</h2><p>{course.description}</p><dl><div><dt>預估時間</dt><dd>{course.estimatedMinutes ?? 120} 分鐘</dd></div><div><dt>課程章節</dt><dd>{course.chapters.length} 個章節、{getLevels(course).length} 個關卡</dd></div><div><dt>學習重點</dt><dd>Input → Process → Output</dd></div></dl><ol className="chapter-overview">{course.chapters.map((chapter, index) => <li key={chapter.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{chapter.title}</strong><p>{chapter.description}</p></div></li>)}</ol></div>
      <StartCourseForm onStart={(input) => { start({ ...input, courseId: course.id, firstLevelId }); navigate(`/course/${course.id}/level/${firstLevelId}`) }} />
    </section>
  </main>
}
