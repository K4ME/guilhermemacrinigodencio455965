import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils/testUtils'
import { userEvent } from '@testing-library/user-event'
import PetCard from '../PetCard/PetCard'
import { mockPet } from '../../test/mocks/apiFacade'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('PetCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('deve renderizar informações do pet', () => {
    render(<PetCard pet={mockPet} />)
    
    expect(screen.getByText('Rex')).toBeInTheDocument()
    expect(screen.getByText('Labrador')).toBeInTheDocument()
    expect(screen.getByText('3 anos')).toBeInTheDocument()
  })

  it('deve navegar ao clicar no card', async () => {
    const user = userEvent.setup()
    render(<PetCard pet={mockPet} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(mockNavigate).toHaveBeenCalledWith('/pets/1')
  })

  it('deve navegar ao pressionar Enter', async () => {
    const user = userEvent.setup()
    render(<PetCard pet={mockPet} />)
    
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')
    
    expect(mockNavigate).toHaveBeenCalledWith('/pets/1')
  })

  it('deve navegar ao pressionar Espaço', async () => {
    const user = userEvent.setup()
    render(<PetCard pet={mockPet} />)
    
    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard(' ')
    
    expect(mockNavigate).toHaveBeenCalledWith('/pets/1')
  })

  it('deve exibir "Idade não informada" quando idade não está definida', () => {
    const petWithoutAge = { ...mockPet, idade: undefined }
    render(<PetCard pet={petWithoutAge} />)
    
    expect(screen.getByText('Idade não informada')).toBeInTheDocument()
  })

  it('deve exibir "1 ano" no singular', () => {
    const petWithOneYear = { ...mockPet, idade: 1 }
    render(<PetCard pet={petWithOneYear} />)
    
    expect(screen.getByText('1 ano')).toBeInTheDocument()
  })
})
