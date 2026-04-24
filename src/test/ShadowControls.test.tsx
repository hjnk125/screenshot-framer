import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShadowControls } from '../components/ShadowControls'
import type { ShadowConfig } from '../types/frame'
import { describe, it, expect, vi } from 'vitest'

const defaultShadow: ShadowConfig = { enabled: false, opacity: 100 }

describe('ShadowControls', () => {
  it('그림자 토글 버튼을 렌더링한다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '그림자 활성화' })).toBeInTheDocument()
  })

  it('disabled 상태에서 슬라이더가 렌더링되지 않는다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('enabled 상태에서 슬라이더가 활성화된다', () => {
    const enabled: ShadowConfig = { ...defaultShadow, enabled: true }
    render(<ShadowControls value={enabled} onChange={() => {}} />)
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(s => expect(s).not.toBeDisabled())
  })

  it('토글 클릭 시 onChange가 호출된다', async () => {
    const onChange = vi.fn()
    render(<ShadowControls value={defaultShadow} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '그림자 활성화' }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultShadow, enabled: true })
  })
})
