import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { loadAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

const basicChecks = [
  '先讀完整的 Arduino IDE 錯誤訊息，確認是 Compile、Upload 還是執行結果問題。',
  '確認程式使用的腳位與實際接線相同，尤其是 Servo 訊號線、5V、GND 與共地。',
  '確認 Arduino IDE 選擇了正確的開發板與 Port，再重新 Compile 與 Upload。',
  '用最小測試程式分別驗證感測器與 Servo，避免同時更動整份程式。',
  '每次只改一件事，重新測試並記錄結果，才能知道是哪個改動有效。',
]

export function DebugPage({ course }: { course: Course }) {
  const { state, addDebug, completeActivity } = useStudent()
  const work = loadAiWork()
  const { taskId } = useParams()
  const [problem, setProblem] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [hardwareState, setHardwareState] = useState('')
  const [attemptedFixes, setAttemptedFixes] = useState('')
  const [debugPrompt, setDebugPrompt] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  if (!state) return <Navigate to="/" replace />
  if (!work?.prompt || !work.code) return <Navigate to={`/coding/${taskId ?? ''}`} replace />
  if (taskId && work.taskId !== taskId) return <Navigate to={`/coding/${taskId}`} replace />
  const submit = (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!problem.trim()) { setError('請先描述你實際觀察到的現象。'); return }
    const prompt = ['我正在排查一個 Arduino 專案，請先分析問題，再提供由最可能到較不可能的檢查順序；不要直接整份重寫程式。', '', '【原始需求】', work.prompt, '', '【目前程式】', work.code, '', '【實際現象】', problem.trim(), '', '【錯誤訊息】', errorMessage.trim() || '沒有', '', '【目前接線】', hardwareState.trim() || '尚未填寫', '', '【已嘗試事項】', attemptedFixes.trim() || '尚未嘗試'].join('\n')
    setDebugPrompt(prompt)
    addDebug({ taskId: work.taskId, problem, result: '已整理成可提供給外部 AI 的 Debug Prompt。' })
    course.chapters.flatMap((chapter) => chapter.levels).flatMap((level) => level.activities ?? []).filter((activity) => (activity.type === 'debug-report' || activity.type === 'test-result') && activity.taskId === work.taskId).forEach((activity) => completeActivity(activity.id))
  }
  const copyDebugPrompt = async () => {
    try {
      await navigator.clipboard.writeText(debugPrompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return <section className="ai-page"><div className="ai-page-heading"><p className="eyebrow">Debug Flow</p><h1>整理可重現的 Debug 資訊</h1><p>網站不會呼叫內建 AI。請先記錄現象、錯誤訊息、實際接線與已嘗試事項，再把整理好的 Debug Prompt 貼到你使用的外部 AI。</p></div>
    <form className="debug-form" onSubmit={submit}><label htmlFor="problem">發生什麼現象？ <span aria-hidden="true">*</span><textarea data-testid="debug-problem" id="problem" value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="例如：Upload 成功，但 Servo 完全沒有動。" rows={4} /></label><label htmlFor="errorMessage">錯誤訊息 <span className="optional">（沒有可留白）</span><textarea id="errorMessage" value={errorMessage} onChange={(event) => setErrorMessage(event.target.value)} placeholder="請貼上 Arduino IDE 顯示的錯誤訊息" rows={3} /></label><label htmlFor="hardwareState">目前接線<textarea data-testid="debug-hardware-state" id="hardwareState" value={hardwareState} onChange={(event) => setHardwareState(event.target.value)} placeholder="例如：Servo 的訊號線接 D9，紅線接 5V，棕線接 GND。" rows={3} /></label><label htmlFor="attemptedFixes">我已經嘗試<textarea data-testid="debug-attempted-fixes" id="attemptedFixes" value={attemptedFixes} onChange={(event) => setAttemptedFixes(event.target.value)} placeholder="例如：重新插線、改用 motor.write(90) 測試。" rows={3} /></label>{error && <p className="api-error" role="alert">{error}</p>}<button data-testid="debug-submit" className="primary-button" type="submit">整理 Debug 回報</button></form>
    {debugPrompt && <section className="debug-result" data-testid="debug-result" aria-live="polite"><h2>先依序檢查</h2><ol data-testid="debug-checks">{basicChecks.map((check) => <li key={check}>{check}</li>)}</ol><div className="code-header"><h2>給外部 AI 的 Debug Prompt</h2><button className="quiet-button" type="button" onClick={copyDebugPrompt}>{copied ? '已複製' : '複製 Debug Prompt'}</button></div><pre><code>{debugPrompt}</code></pre><p className="success-note">✓ 已記錄本次 Debug。你可以先自行檢查，或將 Prompt 貼到外部 AI 後再回 Arduino IDE 測試。</p></section>}
    <Link className="text-link" to={`/coding/${work.taskId}`}>← 返回程式與測試結果</Link>
  </section>
}
