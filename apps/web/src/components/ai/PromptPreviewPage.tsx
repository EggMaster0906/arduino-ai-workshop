import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { Course } from '@arduino-ai/shared'
import { loadAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

export function PromptPreviewPage({ course }: { course: Course }) {
  const { state, completeActivity } = useStudent()
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
    <section className="ai-choice"><h2>把 Prompt 交給你使用的生成式 AI</h2><p>網站不會代替你產生程式碼。請複製這段 Prompt，貼到你自己的 Coding AI、Gemini、ChatGPT 或 Copilot；取得 Arduino 程式碼後，再回到學習區貼上。</p><div><button data-testid="copy-prompt-external" className="secondary-button" type="button" onClick={copy}>{copied ? '已複製 Prompt' : '複製 Prompt 到其他 AI'}</button><div className="external-ai-links" aria-label="開啟外部 AI"><a data-testid="open-gemini" className="external-ai-button gemini-button" href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2c.8 5.8 3.2 8.2 10 10-6.8 1.8-9.2 4.2-10 10-.8-5.8-3.2-8.2-10-10 6.8-1.8 9.2-4.2 10-10Z" /></svg>Gemini</a><a data-testid="open-chatgpt" className="external-ai-button chatgpt-button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3.5 15 5v3.4l3 1.7v4.1L15 16v3.5l-3 1.5-3-1.5V16l-3-1.8v-4.1l3-1.7V5l3-1.5Zm0 3.1-1.5.8v2.8L8 11.6v1.8l2.5 1.4v2.8l1.5.8 1.5-.8V15l2.5-1.4v-1.8l-2.5-1.4V7.4L12 6.6Z" /></svg>ChatGPT</a></div><Link data-testid="open-external-code-paste" className="primary-button" to={`/coding/${work.taskId}`} onClick={markPreview}>我已取得程式碼，前往貼上 →</Link></div><Link className="text-link" to={`/prompt/${work.taskId}`}>← 返回修改需求</Link></section>
  </section>
}
