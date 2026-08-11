import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { AiRequestError, debugCode } from '../../lib/api'
import { loadAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

export function DebugPage({ course }: { course: Course }) {
  const { state, addDebug, completeActivity } = useStudent()
  const work = loadAiWork()
  const { taskId } = useParams()
  const [problem, setProblem] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [hardwareState, setHardwareState] = useState('')
  const [attemptedFixes, setAttemptedFixes] = useState('')
  const [result, setResult] = useState<{ analysis: string; checks: string[]; suggestedCode?: string | null } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (!state) return <Navigate to="/" replace />
  if (!work?.prompt || !work.code) return <Navigate to={`/coding/${taskId ?? ''}`} replace />
  if (taskId && work.taskId !== taskId) return <Navigate to={`/coding/${taskId}`} replace />
  const originalPrompt = work.prompt
  const code = work.code
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!problem.trim()) { setError('請先描述你實際觀察到的現象。'); return }
    setLoading(true)
    try {
      const response = await debugCode({ originalPrompt, code, problem, errorMessage, hardwareState, attemptedFixes, anonymousSessionId: state.anonymousSessionId })
      setResult(response); addDebug({ taskId: work.taskId, problem, result: response.analysis })
      course.chapters.flatMap((chapter) => chapter.levels).flatMap((level) => level.activities ?? []).filter((activity) => (activity.type === 'debug-report' || activity.type === 'test-result') && activity.taskId === work.taskId).forEach((activity) => completeActivity(activity.id))
    } catch (cause) {
      setError(cause instanceof AiRequestError ? cause.message : 'AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。')
    } finally { setLoading(false) }
  }
  return <section className="ai-page"><div className="ai-page-heading"><p className="eyebrow">Debug Flow</p><h1>把真實測試結果提供給 AI</h1><p>不要立刻整份重寫程式。先說明你看到的現象、錯誤訊息和實際接線，讓 AI 協助你排查。</p></div>
    <form className="debug-form" onSubmit={submit}><label htmlFor="problem">發生什麼現象？ <span aria-hidden="true">*</span><textarea data-testid="debug-problem" id="problem" value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="例如：Upload 成功，但 Servo 完全沒有動。" rows={4} /></label><label htmlFor="errorMessage">錯誤訊息 <span className="optional">（沒有可留白）</span><textarea id="errorMessage" value={errorMessage} onChange={(event) => setErrorMessage(event.target.value)} placeholder="請貼上 Arduino IDE 顯示的錯誤訊息" rows={3} /></label><label htmlFor="hardwareState">目前接線<textarea data-testid="debug-hardware-state" id="hardwareState" value={hardwareState} onChange={(event) => setHardwareState(event.target.value)} placeholder="例如：Servo 的訊號線接 D9，紅線接 5V，棕線接 GND。" rows={3} /></label><label htmlFor="attemptedFixes">我已經嘗試<textarea data-testid="debug-attempted-fixes" id="attemptedFixes" value={attemptedFixes} onChange={(event) => setAttemptedFixes(event.target.value)} placeholder="例如：重新插線、改用 motor.write(90) 測試。" rows={3} /></label>{error && <p className="api-error" role="alert">{error}</p>}<button data-testid="debug-submit" className="primary-button" type="submit" disabled={loading}>{loading ? 'AI 分析中…' : '請 AI 協助 Debug'}</button></form>
    {result && <section className="debug-result" data-testid="debug-result" aria-live="polite"><h2>建議的檢查順序</h2><p>{result.analysis}</p><ol data-testid="debug-checks">{result.checks.map((check) => <li key={check}>{check}</li>)}</ol>{result.suggestedCode && <><h3>需要修改的程式</h3><pre><code>{result.suggestedCode}</code></pre></>}<p className="success-note">✓ 已記錄本次 Debug。請依序檢查後，再回 Arduino IDE 測試。</p></section>}
    <Link className="text-link" to={`/coding/${work.taskId}`}>← 返回 AI 程式與測試結果</Link>
  </section>
}
