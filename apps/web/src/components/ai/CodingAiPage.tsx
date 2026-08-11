import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { AiRequestError, generateCode } from '../../lib/api'
import { loadAiWork, saveAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

function completeMatchingActivities(course: Course, type: string, taskId: string, complete: (id: string) => void) {
  course.chapters.flatMap((chapter) => chapter.levels).flatMap((level) => level.activities ?? []).filter((activity) => activity.type === type && activity.taskId === taskId).forEach((activity) => complete(activity.id))
}

export function CodingAiPage({ course }: { course: Course }) {
  const { state, completeActivity } = useStudent()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const [work, setWork] = useState(() => loadAiWork())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [externalCode, setExternalCode] = useState('')
  const [result, setResult] = useState<'success' | 'mismatch' | 'compile-error' | 'no-response' | ''>('')
  if (!state) return <Navigate to="/" replace />
  if (!work?.prompt) return <Navigate to={`/prompt/${taskId ?? ''}`} replace />
  if (taskId && work.taskId !== taskId) return <Navigate to={`/prompt/${taskId}`} replace />
  const prompt = work.prompt
  const askAi = async () => {
    setLoading(true); setError('')
    try {
      const response = await generateCode({ taskId: work.taskId, prompt, anonymousSessionId: state.anonymousSessionId })
      const next = { ...work, code: response.code, codeMessage: response.message }
      saveAiWork(next); setWork(next); completeMatchingActivities(course, 'coding-ai', work.taskId, completeActivity)
    } catch (cause) {
      setError(cause instanceof AiRequestError ? cause.message : 'AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。')
    } finally { setLoading(false) }
  }
  const saveExternalCode = () => {
    if (!externalCode.trim()) return
    const next = { ...work, code: externalCode.trim(), codeMessage: '這份程式由你使用自己的 Coding AI 取得。請確認接線與腳位後，在 Arduino UNO 實際 Upload 測試。' }
    saveAiWork(next); setWork(next); completeMatchingActivities(course, 'coding-ai', work.taskId, completeActivity)
  }
  const continueWithTest = () => {
    if (!result) return
    if (result === 'success') {
      completeMatchingActivities(course, 'test-result', work.taskId, completeActivity)
      const targetLevel = course.chapters.flatMap((chapter) => chapter.levels).find((level) => level.activities?.some((activity) => activity.type === 'test-result' && activity.taskId === work?.taskId))
      navigate(`/course/${course.id}/level/${targetLevel?.id ?? '2-final'}`)
    } else {
      navigate(`/debug/${work.taskId}`)
    }
  }
  return <section className="ai-page"><div className="ai-page-heading"><p className="eyebrow">Coding AI</p><h1>產生 Arduino 程式</h1><p>AI 產生的程式只是開始。請閱讀、Upload，並在真實 UNO 上測試它。</p></div>
    {!work.code ? <section className="ask-ai-card"><h2>準備好了嗎？</h2><p>網站會將你確認過的 Prompt 交給後端的 Coding AI；模型與 API Key 都不會出現在瀏覽器中。</p><button data-testid="coding-ai-generate" type="button" className="primary-button" onClick={askAi} disabled={loading}>{loading ? 'AI 產生程式中…' : '請 AI 產生程式'}</button>{error && <p className="api-error" role="alert">{error}</p>}<details className="external-code"><summary>我已使用自己的 Coding AI</summary><p>把取得的 Arduino 程式貼回這裡，網站才能幫你記錄測試與 Debug。</p><textarea value={externalCode} onChange={(event) => setExternalCode(event.target.value)} rows={7} placeholder="貼上 Arduino 程式" /><button className="secondary-button" type="button" onClick={saveExternalCode} disabled={!externalCode.trim()}>儲存外部 AI 的程式</button></details></section> : <>
      <section className="code-answer" data-testid="coding-ai-code"><h2>AI 的 Arduino 程式</h2><pre><code>{work.code}</code></pre></section><section className="ai-explanation" data-testid="coding-ai-explanation"><h2>AI 的說明</h2><p>{work.codeMessage}</p></section>
      <section className="hardware-task"><div className="hardware-icon" aria-hidden="true">🧪</div><div className="hardware-body"><p className="eyebrow">實際測試</p><h2>請到 Arduino IDE Upload 後再回來</h2><ol><li>先確認接線與程式內的腳位相同。</li><li>Upload 程式並觀察 Servo 與光敏電阻的反應。</li><li>選擇第一次測試結果。</li></ol><fieldset className="test-result"><legend>第一次測試結果如何？</legend>{[
        ['success', '完全成功'], ['mismatch', '可以執行，但效果不符合需求'], ['compile-error', 'Compile Error'], ['no-response', 'Upload 成功，但硬體沒有反應'],
      ].map(([id, label]) => <label key={id}><input data-testid={`test-result-${id}`} type="radio" name="test-result" value={id} checked={result === id} onChange={() => setResult(id as typeof result)} />{label}</label>)}</fieldset><button data-testid="test-result-continue" type="button" className="primary-button" onClick={continueWithTest} disabled={!result}>{result === 'success' ? '紀錄成功並回到課程' : '填寫 Debug 資訊 →'}</button></div></section>
    </>}
    <Link className="text-link" to={`/preview/${work.taskId}`}>← 返回 Prompt 預覽</Link>
  </section>
}
