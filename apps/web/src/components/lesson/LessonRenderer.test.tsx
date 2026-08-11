import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Level } from '@arduino-ai/shared'
import { LessonRenderer } from './LessonRenderer'

const { initialize, renderMermaid } = vi.hoisted(() => ({
  initialize: vi.fn(),
  renderMermaid: vi.fn(),
}))

vi.mock('mermaid', () => ({
  default: { initialize, render: renderMermaid },
}))

describe('LessonRenderer', () => {
  it('將 Mermaid 流程圖渲染成 SVG，而非顯示原始碼', async () => {
    renderMermaid.mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"><text>需求拆解</text></svg>' })
    const level: Level = {
      id: 'test-diagram',
      title: '流程圖測試',
      content: [{ type: 'diagram', title: '需求流程', content: 'flowchart LR\n  A[需求] --> B[Prompt]' }],
      completionRule: {},
    }

    render(<LessonRenderer level={level} />)

    await waitFor(() => expect(screen.getByTestId('mermaid-svg')).toBeInTheDocument())
    expect(screen.queryByText('flowchart LR')).not.toBeInTheDocument()
  })
})
