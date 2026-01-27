# Guia Completo de Testes Unitários

Este documento fornece um guia completo sobre como adicionar e executar testes unitários no projeto.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Executando Testes](#executando-testes)
4. [Escrevendo Testes](#escrevendo-testes)
5. [Boas Práticas](#boas-práticas)
6. [Exemplos Práticos](#exemplos-práticos)

## 🎯 Visão Geral

O projeto utiliza **Vitest** como framework de testes, que é rápido, compatível com Vite e oferece uma API similar ao Jest. Os testes são escritos em TypeScript e seguem a convenção de nomenclatura `*.test.ts` ou `*.test.tsx`.

### Tecnologias Utilizadas

- **Vitest**: Framework de testes rápido e moderno
- **@testing-library/react**: Biblioteca para testar componentes React
- **@testing-library/jest-dom**: Matchers adicionais para DOM
- **@testing-library/user-event**: Simulação de eventos de usuário
- **jsdom**: Ambiente DOM para testes

## ⚙️ Configuração

A configuração dos testes está em `vitest.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Arquivos de Configuração

- **`vitest.config.ts`**: Configuração principal do Vitest
- **`src/test/setup.ts`**: Configuração inicial executada antes de cada teste
- **`src/test/utils/testUtils.tsx`**: Utilitários para renderização de componentes

## 🚀 Executando Testes

### Comandos Disponíveis

```bash
# Executar testes em modo watch (recomendado durante desenvolvimento)
npm test

# Executar testes uma vez
npm run test:run

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Modo Watch

Quando executar `npm test`, o Vitest entra em modo watch:

- **`a`**: Executar todos os testes
- **`f`**: Executar apenas testes que falharam
- **`q`**: Sair do modo watch
- **`p`**: Filtrar por nome de arquivo

## ✍️ Escrevendo Testes

### Estrutura de um Teste

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('NomeDoComponente', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  })

  it('deve fazer algo específico', () => {
    // Arrange: Preparar dados
    const input = 'valor'
    
    // Act: Executar ação
    const result = minhaFuncao(input)
    
    // Assert: Verificar resultado
    expect(result).toBe('esperado')
  })
})
```

### Testes de Stores

Stores são classes que gerenciam estado com BehaviorSubject. Exemplo:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { petStore } from '../PetStore'
import { apiFacade } from '../../services/facade'
import { mockPet, mockPetPaginatedResponse } from '../../test/mocks/apiFacade'

vi.mock('../../services/facade', () => ({
  apiFacade: {
    pets: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('PetStore', () => {
  beforeEach(() => {
    // Reset do store antes de cada teste
    petStore.resetFormState()
    petStore.setSearchTerm('')
    petStore.setPage(0)
    vi.clearAllMocks()
  })

  it('deve carregar pets com sucesso', async () => {
    vi.mocked(apiFacade.pets.getAll).mockResolvedValue(mockPetPaginatedResponse)

    await petStore.loadPets(0, 10)

    expect(petStore.listState.data).toEqual(mockPetPaginatedResponse)
    expect(petStore.listState.loading).toBe(false)
  })
})
```

### Testes de Componentes React

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils/testUtils'
import { userEvent } from '@testing-library/user-event'
import MeuComponente from '../MeuComponente'

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />)
    
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })

  it('deve responder a cliques', async () => {
    const user = userEvent.setup()
    render(<MeuComponente />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('Resultado')).toBeInTheDocument()
  })
})
```

### Testes de Hooks Customizados

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { BehaviorSubject } from 'rxjs'
import { useStore } from '../useStore'

describe('useStore', () => {
  it('deve retornar valor inicial', () => {
    const subject = new BehaviorSubject(0)
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    expect(result.current).toBe(0)
  })

  it('deve atualizar quando o valor muda', async () => {
    const subject = new BehaviorSubject(0)
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    subject.next(1)
    
    await waitFor(() => {
      expect(result.current).toBe(1)
    })
  })
})
```

### Testes de Utilitários

```typescript
import { describe, it, expect } from 'vitest'
import { handleApiError } from '../errorHandler'
import { ApiError } from '../../types/api.types'

describe('errorHandler', () => {
  it('deve retornar mensagem de erro', () => {
    const error: ApiError = { message: 'Erro de teste' }
    expect(handleApiError(error)).toBe('Erro de teste')
  })

  it('deve tratar diferentes tipos de erro', () => {
    const error401: ApiError = { status: 401 }
    expect(handleApiError(error401)).toBe('Sessão expirada...')
  })
})
```

## 📚 Boas Práticas

### 1. Organização de Testes

- Coloque testes próximos aos arquivos testados: `__tests__/` ou `.test.ts`
- Use nomes descritivos: `deve fazer algo quando condição`
- Agrupe testes relacionados com `describe`

### 2. Isolamento

- Cada teste deve ser independente
- Use `beforeEach` e `afterEach` para setup/cleanup
- Limpe mocks entre testes com `vi.clearAllMocks()`

### 3. Mocks

- Mocke dependências externas (APIs, módulos)
- Use mocks compartilhados em `src/test/mocks/`
- Prefira mocks específicos quando possível

### 4. Assertions

- Use matchers específicos: `toBe`, `toEqual`, `toContain`
- Teste comportamentos, não implementação
- Verifique estados e efeitos colaterais

### 5. Cobertura

- Aponte para alta cobertura, mas não obceque
- Priorize testes de lógica crítica
- Teste casos de erro e edge cases

## 💡 Exemplos Práticos

### Exemplo 1: Teste de Store Completo

```typescript
describe('PetStore - loadPets', () => {
  it('deve definir loading como true durante carregamento', async () => {
    vi.mocked(apiFacade.pets.getAll).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockPetPaginatedResponse), 100))
    )

    const loadPromise = petStore.loadPets(0, 10)
    
    expect(petStore.listState.loading).toBe(true)
    
    await loadPromise
    
    expect(petStore.listState.loading).toBe(false)
  })
})
```

### Exemplo 2: Teste de Componente com Interação

```typescript
describe('PetCard', () => {
  it('deve navegar ao clicar', async () => {
    const user = userEvent.setup()
    const mockNavigate = vi.fn()
    
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }))

    render(<PetCard pet={mockPet} />)
    
    await user.click(screen.getByRole('button'))
    
    expect(mockNavigate).toHaveBeenCalledWith('/pets/1')
  })
})
```

### Exemplo 3: Teste de Hook com Observables

```typescript
describe('useStore com BehaviorSubject', () => {
  it('deve atualizar múltiplas vezes', async () => {
    const subject = new BehaviorSubject(0)
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    subject.next(1)
    await waitFor(() => expect(result.current).toBe(1))
    
    subject.next(2)
    await waitFor(() => expect(result.current).toBe(2))
  })
})
```

## 🔧 Resolução de Problemas

### Problema: Testes lentos

**Solução**: Use mocks para APIs e evite chamadas HTTP reais nos testes.

### Problema: Warnings do React Router

**Solução**: São apenas avisos sobre futuras versões. Podem ser ignorados ou configurados no BrowserRouter.

### Problema: Estado compartilhado entre testes

**Solução**: Sempre limpe o estado em `beforeEach` ou `afterEach`.

### Problema: Async/await não funciona

**Solução**: Use `waitFor` do Testing Library para aguardar atualizações assíncronas.

## 📊 Cobertura de Código

Execute `npm run test:coverage` para gerar relatório de cobertura. O relatório HTML será gerado em `coverage/index.html`.

### Metas de Cobertura

- **Stores**: 80%+
- **Hooks**: 80%+
- **Componentes**: 70%+
- **Utilitários**: 90%+

## 📖 Recursos Adicionais

- [Documentação do Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Guia de Testes React](https://react.dev/learn/testing)
- [RxJS Testing](https://rxjs.dev/guide/testing)

## 🎓 Próximos Passos

1. Adicione testes para novos componentes conforme são criados
2. Mantenha cobertura acima de 70%
3. Revise testes quando refatorar código
4. Use testes para documentar comportamento esperado
