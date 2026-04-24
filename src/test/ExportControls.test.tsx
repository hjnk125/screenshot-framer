import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportControls } from '../components/ExportControls'
import { describe, it, expect, vi } from 'vitest'

describe('ExportControls', () => {
  it('1x/2x/3x 버튼을 렌더링한다', () => {
    render(<ExportControls onExport={() => {}} disabled={false} />)
    expect(screen.getByRole('button', { name: '1x' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2x' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3x' })).toBeInTheDocument()
  })

  it('저장 버튼을 렌더링한다', () => {
    render(<ExportControls onExport={() => {}} disabled={false} />)
    expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument()
  })

  it('저장 클릭 시 선택된 스케일로 onExport를 호출한다', async () => {
    const onExport = vi.fn()
    render(<ExportControls onExport={onExport} disabled={false} />)
    await userEvent.click(screen.getByRole('button', { name: '2x' }))
    await userEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(onExport).toHaveBeenCalledWith(2)
  })

  it('disabled 상태에서 저장 버튼이 비활성화된다', () => {
    render(<ExportControls onExport={() => {}} disabled={true} />)
    expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled()
  })
})
