import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShadowControls } from '../components/ShadowControls'
import type { ShadowConfig } from '../types/frame'
import { describe, it, expect, vi } from 'vitest'

const defaultShadow: ShadowConfig = { enabled: false, color: '#000000', blur: 40, intensity: 50 }

describe('ShadowControls', () => {
  it('그림자 체크박스를 렌더링한다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('disabled 상태에서 슬라이더가 비활성화된다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(s => expect(s).toBeDisabled())
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
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith({ ...defaultShadow, enabled: true })
  })
})
