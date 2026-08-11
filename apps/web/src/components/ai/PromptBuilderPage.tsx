import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Course, PromptTask } from '@arduino-ai/shared'
import { coachPrompt, AiRequestError } from '../../lib/api'
import { loadAiWork, saveAiWork } from '../../lib/storage'
import { useStudent } from '../../hooks/useStudent'

function activityIds(course: Course, type: string, taskId: string) {
  return course.chapters.flatMap((chapter) => chapter.levels).flatMap((level) => level.activities ?? []).filter((activity) => activity.type === type && activity.taskId === taskId).map((activity) => activity.id)
}

export function PromptBuilderPage({ course, taskFor }: { course: Course; taskFor: (taskId?: string) => PromptTask }) {
  const { state, addPrompt, completeActivity } = useStudent()
  const navigate = useNavigate()
  const { taskId: taskIdParam } = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const taskId = searchParams.get('task') ?? taskIdParam
  const returnLevelId = searchParams.get('returnLevel')
  const task = taskFor(taskId)
  const prior = useMemo(() => loadAiWork(), [])
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(task.fields.map((field): [string, string] => {
    const value = prior?.requirements[field.id]
    return [field.id, typeof value === 'string' ? value : '']
  })))
  const [missing, setMissing] = useState<Array<{ field: string; question: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  if (!state) return <Navigate to="/" replace />
  const requiredMissing = task.fields.filter((field) => field.required && !values[field.id]?.trim())
  const update = (id: string, value: string) => setValues((current) => ({ ...current, [id]: value }))
  const toggleCheckbox = (id: string, option: string) => {
    const selected = new Set((values[id] ?? '').split('\n').filter(Boolean))
    selected.has(option) ? selected.delete(option) : selected.add(option)
    update(id, [...selected].join('\n'))
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError('')
    if (requiredMissing.length) return
    setSubmitting(true)
    try {
      const result = await coachPrompt({ taskId: task.id, requirements: values, anonymousSessionId: state.anonymousSessionId })
      if (!result.complete || !result.prompt) {
        setMissing(result.missingFields)
        saveAiWork({ taskId: task.id, requirements: values, structuredRequirement: result.structuredRequirement })
        return
      }
      saveAiWork({ taskId: task.id, requirements: values, structuredRequirement: result.structuredRequirement, prompt: result.prompt })
      addPrompt({ taskId: task.id, rawRequirements: values, prompt: result.prompt })
      ;['prompt-builder', 'prompt-coach'].forEach((type) => activityIds(course, type, task.id).forEach(completeActivity))
      const returnLevel = course.chapters.flatMap((chapter) => chapter.levels).find((level) => level.id === returnLevelId && level.activities?.some((activity) => activity.type === 'prompt-builder' && activity.taskId === task.id))
      navigate(returnLevel ? `/course/${course.id}/level/${returnLevel.id}` : `/preview/${task.id}`)
    } catch (cause) {
      setError(cause instanceof AiRequestError ? cause.message : 'AI 目前沒有成功回覆。你填寫的資料不會消失，可以再次嘗試。')
    } finally {
      setSubmitting(false)
    }
  }
  return <section className="ai-page" data-testid={`prompt-task-${task.id}`}><div className="ai-page-heading"><p className="eyebrow">五問需求拆解法</p><h1>{task.title}</h1><p>{task.description}</p></div><form className="prompt-form" onSubmit={submit} noValidate>
    {task.fields.map((field) => <div className="prompt-field" key={field.id}><label htmlFor={field.id}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label><p>{field.prompt ?? (('helperText' in field && typeof field.helperText === 'string') ? field.helperText : '請填寫你的真實需求。')}</p>
      {field.type === 'select' ? <select data-testid={`prompt-field-${field.id}`} id={field.id} value={values[field.id] ?? ''} onChange={(event) => update(field.id, event.target.value)} aria-invalid={submitted && field.required && !values[field.id]?.trim()}><option value="">請選擇</option>{field.options?.map((option) => <option key={option.id} value={option.label}>{option.label}</option>)}</select> : field.type === 'checkbox-group' ? <div className="checkbox-options" role="group" aria-label={field.label}>{field.options?.map((option) => <label key={option.id}><input data-testid={`prompt-field-${field.id}-${option.id}`} type="checkbox" checked={(values[field.id] ?? '').split('\n').includes(option.label)} onChange={() => toggleCheckbox(field.id, option.label)} />{option.label}</label>)}</div> : field.type === 'text' ? <input data-testid={`prompt-field-${field.id}`} id={field.id} value={values[field.id] ?? ''} onChange={(event) => update(field.id, event.target.value)} placeholder={field.placeholder} aria-invalid={submitted && field.required && !values[field.id]?.trim()} /> : <textarea data-testid={`prompt-field-${field.id}`} id={field.id} rows={field.id === 'logic' ? 5 : 4} value={values[field.id] ?? ''} onChange={(event) => update(field.id, event.target.value)} placeholder={field.placeholder} aria-invalid={submitted && field.required && !values[field.id]?.trim()} />}
      {submitted && field.required && !values[field.id]?.trim() && <p className="field-error">請填寫這一項。</p>}
    </div>)}
    {missing.length > 0 && <section className="clarification-card" data-testid="prompt-clarification" aria-live="polite"><h2>你的需求還少一些資訊</h2><p>AI 不應該替你猜。補上後再請 Prompt Coach 整理一次。</p>{missing.map((item) => <label key={item.field} htmlFor={`missing-${item.field}`}>{item.question}<input id={`missing-${item.field}`} value={values[item.field] ?? ''} onChange={(event) => update(item.field, event.target.value)} placeholder="輸入你的答案" /></label>)}</section>}
    {error && <p className="api-error" role="alert">{error}</p>}
    <div className="form-actions"><button data-testid="prompt-coach-submit" type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Prompt Coach 整理中…' : '請 Prompt Coach 檢查需求'}</button></div>
  </form></section>
}
