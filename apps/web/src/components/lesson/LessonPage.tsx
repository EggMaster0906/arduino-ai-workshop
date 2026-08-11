import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { LessonRenderer } from './LessonRenderer'
import { canCompleteLevel, canOpenLevel, findLevel, getNextLevel, getPreviousLevel } from '../../lib/progress'
import { useStudent } from '../../hooks/useStudent'

export function LessonPage({ course }: { course: Course }) {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const { state, completeLevel, setCurrentLevel } = useStudent()
  const level = levelId ? findLevel(course, levelId) : undefined
  const teacherMode = new URLSearchParams(window.location.search).get('teacherMode') === '1'
  useEffect(() => {
    if (state && level && state.currentLevelId !== level.id) setCurrentLevel(level.id)
  }, [level, setCurrentLevel, state])
  if (!state) return <Navigate to="/" replace />
  if (!level) return <Navigate to={`/course/${course.id}/level/${state.currentLevelId}`} replace />
  if (!teacherMode && !canOpenLevel(course, state, level.id)) return <Navigate to={`/course/${course.id}/level/${state.currentLevelId}`} replace />
  const previous = getPreviousLevel(course, level.id)
  const next = getNextLevel(course, level.id)
  const ready = canCompleteLevel(level, state)
  const promptBuilder = level.activities?.find((activity) => activity.type === 'prompt-builder')
  const finish = () => {
    if (!ready) return
    completeLevel(level.id, next?.id)
    if (next) navigate(`/course/${course.id}/level/${next.id}`)
  }

  return <div className="lesson-page" data-testid="lesson-page">
    <div className="lesson-heading"><p className="eyebrow">{course.chapters.find((chapter) => chapter.levels.some((item) => item.id === level.id))?.title}</p><h1>{level.title}</h1><p>{level.summary}</p>{level.estimatedMinutes && <span className="time-badge">約 {level.estimatedMinutes} 分鐘</span>}</div>
    <LessonRenderer level={level} />
    {promptBuilder && <section className="next-step-card"><div><p className="eyebrow">下一個任務</p><h2>把你的想法整理成 Prompt</h2><p>先說清楚需求，再把完成的 Prompt 交給你使用的外部生成式 AI。</p></div><Link className="primary-button" to={`/prompt?task=${promptBuilder.taskId ?? ''}`}>前往 Prompt Builder</Link></section>}
    <nav className="lesson-actions" aria-label="關卡導覽">
      {previous ? <Link className="secondary-button" to={`/course/${course.id}/level/${previous.id}`}>← 上一關</Link> : <span />}
      {state.completedLevels.includes(level.id) ? <p className="completed-note">✓ 這一關已完成</p> : <button data-testid="complete-level" type="button" className="primary-button" onClick={finish} disabled={!ready}>{next ? '完成並前往下一關 →' : '完成課程'}</button>}
    </nav>
    {!ready && !state.completedLevels.includes(level.id) && <p className="completion-hint" role="status">請完成必答題{level.completionRule.requiresHardwareConfirmation ? '與 Arduino 實作確認' : ''}後，才能進入下一關。</p>}
  </div>
}
