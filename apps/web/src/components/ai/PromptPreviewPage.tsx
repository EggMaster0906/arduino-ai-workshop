import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { loadAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

export function PromptPreviewPage({ course }: { course: Course }) {
  const { state, completeActivity } = useStudent()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const [copied, setCopied] = useState(false)
  const work = loadAiWork()
  if (!state) return <Navigate to="/" replace />
  if (!work?.prompt) return <Navigate to={`/prompt/${taskId ?? ''}`} replace />
  if (taskId && work.taskId !== taskId) return <Navigate to={`/prompt/${taskId}`} replace />
  const markPreview = () => course.chapters.flatMap((chapter) => chapter.levels).flatMap((level) => level.activities ?? []).filter((activity) => activity.type === 'prompt-preview' && activity.taskId === work.taskId).forEach((activity) => completeActivity(activity.id))
  const copy = async () => {
    try { await navigator.clipboard.writeText(work.prompt ?? ''); setCopied(true); markPreview(); window.setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }
  return <section className="ai-page" data-testid="prompt-preview"><div className="ai-page-heading"><p className="eyebrow">Before / After</p><h1>確認你的最終 Prompt</h1><p>這是根據你的想法整理的版本。檢查它有沒有寫對，再決定要用哪一種 AI 工具。</p></div>
    <div className="preview-grid"><section className="preview-card"><h2>我的原始想法</h2><dl>{Object.entries(work.requirements).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl></section><section className="preview-card" data-testid="structured-requirement"><h2>整理後的需求</h2><dl>{Object.entries(work.structuredRequirement ?? {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{Array.isArray(value) ? value.join('、') : String(value)}</dd></div>)}</dl></section></div>
    <section className="final-prompt" data-testid="final-prompt"><div className="code-header"><h2>最終 Prompt</h2><button className="quiet-button" type="button" onClick={copy}>{copied ? '已複製' : '複製 Prompt'}</button></div><pre><code>{work.prompt}</code></pre></section>
    <section className="ai-choice"><h2>選擇接下來的 AI 路徑</h2><p>你可以使用自己的 Coding AI，或將這段 Prompt 複製貼到 Gemini、ChatGPT、Copilot 等生成式 AI 對話中。</p><div><button className="secondary-button" type="button" onClick={copy}>複製後使用自己的 AI</button><button data-testid="use-built-in-coding-ai" className="primary-button" type="button" onClick={() => { markPreview(); navigate(`/coding/${work.taskId}`) }}>使用網站內建 Coding AI →</button></div><Link className="text-link" to={`/prompt/${work.taskId}`}>← 返回修改需求</Link></section>
  </section>
}
