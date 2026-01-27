import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils/testUtils'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar spinner com mensagem padrão', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve renderizar spinner com mensagem customizada', () => {
    render(<LoadingSpinner message="Carregando dados..." />)
    
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
  })

  it('deve ter classe de animação', () => {
    const { container } = render(<LoadingSpinner />)
    
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('deve renderizar em tela cheia quando fullScreen é true', () => {
    const { container } = render(<LoadingSpinner fullScreen />)
    
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('min-h-screen')
  })
})
