import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { isExerciseAnswerCorrect, type ContentBlock, type Exercise, type HardwareTask, type Level } from '@arduino-ai/shared'
import { useStudent } from '../../hooks/useStudent'

function MarkdownContent({ content }: { content: string }) {
  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>
}

function CodeBlock({ code, title, language }: Extract<ContentBlock, { type: 'code' }>) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return <section className="code-block" aria-label={title ?? `${language} 程式碼`}>
    <div className="code-header"><span>{title ?? `${language} 程式碼`}</span><button className="quiet-button" type="button" onClick={copy}>{copied ? '已複製' : '複製程式碼'}</button></div>
    <pre><code>{code}</code></pre>
  </section>
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { state, answer } = useStudent()
  const value = state?.answers[exercise.id]
  const [touched, setTouched] = useState(false)
  const isCorrect = isExerciseAnswerCorrect(exercise, value)
  const hasValue = typeof value === 'string' ? value.trim().length > 0 : value !== undefined

  return <fieldset className="exercise-card" data-testid={`exercise-${exercise.id}`}>
    <legend><span className="eyebrow">理解檢核</span><span>{exercise.question}</span></legend>
    {exercise.type === 'multiple-choice' && <div className="option-list">
      {exercise.options.map((option) => <label className={`option ${value === option.id ? 'selected' : ''}`} key={option.id}>
        <input data-testid={`exercise-${exercise.id}-option-${option.id}`} type="radio" name={exercise.id} checked={value === option.id} onChange={() => { answer(exercise.id, option.id); setTouched(true) }} />
        <span>{option.label}</span>
      </label>)}
    </div>}
    {exercise.type === 'fill-blank' && <div className="answer-row">
      <label className="sr-only" htmlFor={exercise.id}>你的答案</label>
      <input id={exercise.id} value={typeof value === 'string' ? value : ''} onChange={(event) => answer(exercise.id, event.target.value)} onBlur={() => setTouched(true)} placeholder="輸入答案" autoComplete="off" />
      <button type="button" className="secondary-button" onClick={() => setTouched(true)}>檢查答案</button>
    </div>}
    {exercise.type === 'reflection' && <label className="field-label" htmlFor={exercise.id}>
      <span className="sr-only">你的觀察</span>
      <textarea id={exercise.id} value={typeof value === 'string' ? value : ''} onChange={(event) => answer(exercise.id, event.target.value)} onBlur={() => setTouched(true)} placeholder={exercise.placeholder ?? '寫下你的想法'} rows={3} />
    </label>}
    {touched && hasValue && <p className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
      <strong>{isCorrect ? '✓ 已完成' : '再想一想'}</strong>{exercise.explanation ? `：${exercise.explanation}` : isCorrect ? '，你的答案已儲存。' : '，可回到教材再找找線索。'}
    </p>}
  </fieldset>
}

function HardwareTaskCard({ levelId, task }: { levelId: string; task: HardwareTask }) {
  const { state, confirmHardware } = useStudent()
  const completed = state?.hardwareConfirmations[levelId] === true
  return <section className="hardware-task" data-testid={`hardware-task-${levelId}`} aria-labelledby={`${levelId}-hardware-title`}>
    <div className="hardware-icon" aria-hidden="true">🧪</div>
    <div className="hardware-body">
      <p className="eyebrow">現在換你實際操作 Arduino</p>
      <h3 id={`${levelId}-hardware-title`}>{task.title}</h3>
      <ol>{task.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
      {task.expectedObservation && <p className="expected"><strong>預期現象：</strong>{task.expectedObservation}</p>}
      {task.completionQuestion && <p className="completion-question">{task.completionQuestion}</p>}
      <button type="button" className={completed ? 'success-button' : 'primary-button'} onClick={() => confirmHardware(levelId, !completed)} aria-pressed={completed}>
        {completed ? '✓ 已完成實作（再按一次可取消）' : '我完成了實作'}
      </button>
    </div>
  </section>
}

function ContentRenderer({ block, exercises }: { block: ContentBlock; exercises: Exercise[] }) {
  if (block.type === 'markdown') return <MarkdownContent content={block.content} />
  if (block.type === 'code') return <CodeBlock {...block} />
  if (block.type === 'callout') return <aside className={`callout ${block.tone}`}><strong>{block.title ?? '重點'}</strong><MarkdownContent content={block.content} /></aside>
  if (block.type === 'diagram') return <figure className="diagram"><figcaption>{block.title}</figcaption><div>{block.content}</div></figure>
  if (block.type === 'image') return <figure className="image-block"><img src={block.src} alt={block.alt} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  if (block.type === 'hardware-instruction') return <HardwareTaskCard levelId={`block-${block.title}`} task={block} />
  const exercise = exercises.find((item) => item.id === block.exerciseId)
  return exercise ? <ExerciseCard exercise={exercise} /> : null
}

export function LessonRenderer({ level }: { level: Level }) {
  const embeddedIds = new Set(level.content.filter((block) => block.type === 'question').map((block) => block.exerciseId))
  return <article className="lesson-renderer">
    {level.content.map((block, index) => <ContentRenderer key={`${block.type}-${index}`} block={block} exercises={level.exercises ?? []} />)}
    {level.exercises?.filter((exercise) => !embeddedIds.has(exercise.id)).map((exercise) => <ExerciseCard exercise={exercise} key={exercise.id} />)}
    {level.hardwareTask && <HardwareTaskCard levelId={level.id} task={level.hardwareTask} />}
  </article>
}
