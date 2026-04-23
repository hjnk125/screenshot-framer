import { render, screen } from '@testing-library/react'
import { Toast } from '../components/Toast'

describe('Toast', () => {
  it('message가 있으면 렌더링한다', () => {
    render(<Toast message="이미지가 너무 큽니다." onClose={() => {}} />)
    expect(screen.getByText('이미지가 너무 큽니다.')).toBeInTheDocument()
  })

  it('message가 null이면 렌더링하지 않는다', () => {
    const { container } = render(<Toast message={null} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
