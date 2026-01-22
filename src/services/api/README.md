# Serviços da API

Esta pasta contém os serviços específicos da API. Cada serviço estende a classe `BaseService` e fornece métodos para interagir com endpoints específicos.

## Estrutura

```
api/
├── petService.ts    # Serviço de exemplo para gerenciar pets
└── index.ts         # Exportações centralizadas
```

## Como criar um novo serviço

1. **Defina os tipos** (se necessário):

```typescript
export interface MyResource {
  id: string
  name: string
  // ... outros campos
}

export interface CreateMyResourceDto {
  name: string
  // ... outros campos
}
```

2. **Crie o serviço**:

```typescript
import { BaseService } from '../http/baseService'
import type { MyResource, CreateMyResourceDto } from './types'

class MyResourceService extends BaseService {
  constructor() {
    super('/my-resources') // Endpoint base da API
  }

  async getAll(): Promise<MyResource[]> {
    return this.get<MyResource[]>()
  }

  async getById(id: string): Promise<MyResource> {
    return this.get<MyResource>(`/${id}`)
  }

  async create(data: CreateMyResourceDto): Promise<MyResource> {
    return this.post<MyResource>('', data)
  }

  async update(id: string, data: Partial<CreateMyResourceDto>): Promise<MyResource> {
    return this.put<MyResource>(`/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    return this.delete<void>(`/${id}`)
  }
}

export const myResourceService = new MyResourceService()
```

3. **Exporte no index.ts**:

```typescript
export { myResourceService } from './myResourceService'
export type { MyResource, CreateMyResourceDto } from './myResourceService'
```

## Métodos disponíveis do BaseService

- `get<T>(endpoint, config?)` - Requisição GET
- `post<T>(endpoint, data?, config?)` - Requisição POST
- `put<T>(endpoint, data?, config?)` - Requisição PUT
- `patch<T>(endpoint, data?, config?)` - Requisição PATCH
- `delete<T>(endpoint, config?)` - Requisição DELETE
- `getPaginated<T>(endpoint, page, limit, config?)` - GET com paginação

## Exemplo de uso

```typescript
import { myResourceService } from './services/api'

// Buscar todos
const resources = await myResourceService.getAll()

// Buscar por ID
const resource = await myResourceService.getById('123')

// Criar
const newResource = await myResourceService.create({ name: 'Novo' })

// Atualizar
const updated = await myResourceService.update('123', { name: 'Atualizado' })

// Deletar
await myResourceService.delete('123')
```
