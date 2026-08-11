import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
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
  const [externalCode, setExternalCode] = useState(() => loadAiWork()?.code ?? '')
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<'success' | 'mismatch' | 'compile-error' | 'no-response' | ''>('')
  if (!state) return <Navigate to="/" replace />
  if (!work?.prompt) return <Navigate to={`/prompt/${taskId ?? ''}`} replace />
  if (taskId && work.taskId !== taskId) return <Navigate to={`/prompt/${taskId}`} replace />
  const prompt = work.prompt
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
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
  return <section className="ai-page"><div className="ai-page-heading"><p className="eyebrow">外部 AI 協作</p><h1>貼回 Arduino 程式</h1><p>網站不會呼叫內建 Coding AI。請使用你自己的生成式 AI 取得程式碼，再貼回這裡進行實機測試與學習紀錄。</p></div>
    {!work.code ? <section className="ask-ai-card"><h2>從其他 AI 取得程式碼</h2><ol><li>複製已完成的 Prompt。</li><li>貼到你使用的 Coding AI、Gemini、ChatGPT 或 Copilot。</li><li>把 AI 回傳的 Arduino 程式碼貼到下方。</li></ol><button type="button" className="secondary-button" onClick={copyPrompt}>{copied ? '已複製 Prompt' : '再次複製 Prompt'}</button><div className="external-code"><label htmlFor="external-code-input">外部 AI 回傳的 Arduino 程式碼<textarea data-testid="external-code-input" id="external-code-input" value={externalCode} onChange={(event) => setExternalCode(event.target.value)} rows={12} placeholder="請貼上 Arduino 程式碼，例如：#include <Servo.h>" /></label><button data-testid="external-code-save" className="primary-button" type="button" onClick={saveExternalCode} disabled={!externalCode.trim()}>儲存程式並開始測試 →</button></div></section> : <>
      <section className="code-answer" data-testid="external-code-preview"><h2>你貼回的 Arduino 程式</h2><pre><code>{work.code}</code></pre></section><section className="ai-explanation" data-testid="external-code-note"><h2>下一步</h2><p>{work.codeMessage}</p></section>
      <section className="hardware-task"><div className="hardware-icon" aria-hidden="true">🧪</div><div className="hardware-body"><p className="eyebrow">實際測試</p><h2>請到 Arduino IDE Upload 後再回來</h2><ol><li>先確認接線與程式內的腳位相同。</li><li>Upload 程式並觀察 Servo 與光敏電阻的反應。</li><li>選擇第一次測試結果。</li></ol><fieldset className="test-result"><legend>第一次測試結果如何？</legend>{[
        ['success', '完全成功'], ['mismatch', '可以執行，但效果不符合需求'], ['compile-error', 'Compile Error'], ['no-response', 'Upload 成功，但硬體沒有反應'],
      ].map(([id, label]) => <label key={id}><input data-testid={`test-result-${id}`} type="radio" name="test-result" value={id} checked={result === id} onChange={() => setResult(id as typeof result)} />{label}</label>)}</fieldset><button data-testid="test-result-continue" type="button" className="primary-button" onClick={continueWithTest} disabled={!result}>{result === 'success' ? '紀錄成功並回到課程' : '填寫 Debug 資訊 →'}</button></div></section>
    </>}
    <Link className="text-link" to={`/preview/${work.taskId}`}>← 返回 Prompt 預覽</Link>
  </section>
}
