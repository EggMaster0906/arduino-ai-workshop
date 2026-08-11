import { useState, type FormEvent } from 'react'

interface StartCourseFormProps {
  onStart: (input: { displayName: string; studentCode?: string; group?: string }) => void
}

export function StartCourseForm({ onStart }: StartCourseFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [group, setGroup] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!displayName.trim()) return
    onStart({ displayName, studentCode, group })
  }
  return <form className="start-form" onSubmit={submit} noValidate>
    <h2>先建立你的本機學習紀錄</h2>
    <p>不需要帳號或密碼，資料只會保留在這台電腦的瀏覽器。</p>
    <label htmlFor="displayName">你的名字或暱稱 <span aria-hidden="true">*</span></label>
    <input id="displayName" data-testid="student-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} autoFocus aria-invalid={submitted && !displayName.trim()} aria-describedby={submitted && !displayName.trim() ? 'name-error' : undefined} />
    {submitted && !displayName.trim() && <p id="name-error" className="field-error" role="alert">請先輸入名字或暱稱。</p>}
    <label htmlFor="studentCode">座號或代號 <span className="optional">（選填）</span></label>
    <input id="studentCode" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} maxLength={40} />
    <label htmlFor="group">班級／組別 <span className="optional">（選填）</span></label>
    <input id="group" value={group} onChange={(event) => setGroup(event.target.value)} maxLength={40} />
    <button type="submit" className="primary-button" data-testid="course-start">開始上課</button>
  </form>
}
