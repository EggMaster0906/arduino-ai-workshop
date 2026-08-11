import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { getProgress } from '../../lib/progress'
import { useStudent } from '../../hooks/useStudent'

export function MainLayout({ course }: { course: Course }) {
  const { state, reset } = useStudent()
  const location = useLocation()
  const navigate = useNavigate()
  const progress = getProgress(course, state)
  const teacherMode = new URLSearchParams(window.location.search).get('teacherMode') === '1'
  const confirmedReset = () => {
    if (window.confirm('確定要清除這台電腦的學習紀錄嗎？此操作無法復原。')) {
      reset()
      navigate('/')
    }
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">跳到主要內容</a>
    <header className="app-header">
      <Link className="brand" to="/">Arduino <span>×</span> AI Lab</Link>
      <div className="header-progress" data-testid="course-progress" aria-label={`課程進度 ${progress.completed} / ${progress.total}`}>
        <span>進度</span><strong>{progress.completed} / {progress.total}</strong>
        <div className="progress-track"><div style={{ width: `${progress.percentage}%` }} /></div>
      </div>
      <div className="student-menu"><span data-testid="student-display-name-current">{state?.student.displayName ?? '學習者'}</span><button className="text-button" type="button" onClick={confirmedReset}>清除紀錄</button></div>
    </header>
    <div className="workspace">
      <aside className="course-sidebar" aria-label="課程關卡">
        <p className="sidebar-title">課程章節</p>
        {course.chapters.map((chapter) => <section key={chapter.id} className="chapter-nav">
          <h2>{chapter.title}</h2>
          <ul>{chapter.levels.map((level, index) => {
            const globallyIndexed = course.chapters.flatMap((item) => item.levels).findIndex((item) => item.id === level.id)
            const prior = course.chapters.flatMap((item) => item.levels)[globallyIndexed - 1]
            const complete = state?.completedLevels.includes(level.id)
            const current = state?.currentLevelId === level.id
            const unlocked = teacherMode || globallyIndexed === 0 || Boolean(prior && state?.completedLevels.includes(prior.id)) || complete || current
            const target = `/course/${course.id}/level/${level.id}`
            return <li key={level.id}>
              {unlocked ? <NavLink to={target} className={({ isActive }) => `level-link ${isActive ? 'active' : ''}`} aria-current={location.pathname.includes(`/level/${level.id}`) ? 'step' : undefined}>
                <span className={`level-status ${complete ? 'complete' : current ? 'current' : ''}`} aria-hidden="true">{complete ? '✓' : current ? '●' : '○'}</span><span><small>{String(index + 1).padStart(2, '0')}</small>{level.title}</span>
              </NavLink> : <span className="level-link locked" aria-label={`${level.title} 尚未解鎖`}><span className="level-status" aria-hidden="true">○</span><span><small>{String(index + 1).padStart(2, '0')}</small>{level.title}</span></span>}
            </li>
          })}</ul>
        </section>)}
      </aside>
      <main id="main-content" className="main-content"><Outlet /></main>
    </div>
  </div>
}
