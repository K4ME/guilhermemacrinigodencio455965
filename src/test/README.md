# Guia de Testes

Este diretório contém configurações e utilitários para testes unitários do projeto.

## Estrutura

```
src/test/
├── setup.ts              # Configuração inicial dos testes
├── utils/
│   └── testUtils.tsx     # Utilitários para renderização de componentes
└── mocks/
    └── apiFacade.ts      # Mocks do ApiFacade para testes
```

## Executando Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm test
# Pressione 'a' para executar todos os testes
# Pressione 'f' para executar apenas testes que falharam
# Pressione 'q' para sair
```

### Executar testes com UI
```bash
npm run test:ui
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes uma vez (sem watch)
```bash
npm run test:run
```

## Escrevendo Testes

### Testes de Stores

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { petStore } from '../stores'

describe('PetStore', () => {
  beforeEach(() => {
    // Reset do store antes de cada teste
  })

  it('deve carregar pets', async () => {
    // Seu teste aqui
  })
})
```

### Testes de Componentes

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils/testUtils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testes de Hooks

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('deve retornar valor inicial', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current).toBeDefined()
  })
})
```

## Mocks

Use os mocks em `src/test/mocks/` para simular chamadas de API nos testes.

```typescript
import { createMockApiFacade } from '../../test/mocks/apiFacade'

vi.mock('../../services/facade', () => ({
  apiFacade: createMockApiFacade(),
}))
```
