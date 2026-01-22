# React + TypeScript + Vite

Este projeto foi criado com Vite, React e TypeScript.

## 🚀 Como executar

### Instalar dependências
```bash
npm install
```

### Executar em modo de desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

### Preview da build de produção
```bash
npm run preview
```

## 📁 Estrutura do projeto

```
├── src/
│   ├── config/
│   │   └── env.ts              # Configuração de variáveis de ambiente
│   ├── hooks/
│   │   ├── useApi.ts           # Hook para requisições GET
│   │   ├── useMutation.ts      # Hook para mutações (POST, PUT, DELETE)
│   │   └── index.ts            # Exportações dos hooks
│   ├── services/
│   │   ├── http/
│   │   │   ├── httpClient.ts   # Cliente HTTP base com axios
│   │   │   ├── baseService.ts  # Classe base para serviços
│   │   │   └── index.ts        # Exportações
│   │   └── api/
│   │       ├── petService.ts   # Serviço de exemplo (Pets)
│   │       └── index.ts        # Exportações dos serviços
│   ├── types/
│   │   └── api.types.ts        # Tipos e interfaces da API
│   ├── utils/
│   │   └── errorHandler.ts     # Utilitário para tratamento de erros
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Ponto de entrada da aplicação
│   ├── index.css               # Estilos globais (Tailwind directives)
│   └── vite-env.d.ts           # Tipos do Vite
├── index.html                  # HTML principal
├── vite.config.ts              # Configuração do Vite
├── tailwind.config.js          # Configuração do Tailwind CSS
├── postcss.config.js           # Configuração do PostCSS
├── tsconfig.json               # Configuração do TypeScript
└── package.json                # Dependências do projeto
```

## 🛠️ Tecnologias

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP para requisições
- **PostCSS** - Ferramenta para transformar CSS
- **ESLint** - Linter para manter a qualidade do código

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `env.example` para `.env` e configure as variáveis:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
VITE_API_BASE_URL=https://pet-manager-api.geia.vip
VITE_API_TIMEOUT=30000
```

## 📚 Uso da API

### Exemplo com Hook useApi (GET)

```typescript
import { useApi } from './hooks'
import { petService } from './services/api'

const MyComponent = () => {
  const { data, loading, error, execute } = useApi(
    () => petService.getAll(),
    { immediate: true }
  )

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return <div>{/* Renderizar dados */}</div>
}
```

### Exemplo com Hook useMutation (POST/PUT/DELETE)

```typescript
import { useMutation } from './hooks'
import { petService } from './services/api'

const CreatePetForm = () => {
  const { mutate, loading, error } = useMutation(
    (data) => petService.create(data)
  )

  const handleSubmit = async (formData) => {
    try {
      const result = await mutate(formData)
      console.log('Pet criado:', result)
    } catch (err) {
      console.error('Erro ao criar pet:', err)
    }
  }

  return <form onSubmit={handleSubmit}>{/* Formulário */}</form>
}
```

### Criando um Novo Serviço

1. Crie um novo arquivo em `src/services/api/`:

```typescript
import { BaseService } from '../http/baseService'

class MyService extends BaseService {
  constructor() {
    super('/my-endpoint')
  }

  async getAll() {
    return this.get()
  }

  async getById(id: string) {
    return this.get(`/${id}`)
  }

  async create(data: CreateDto) {
    return this.post('', data)
  }
}

export const myService = new MyService()
```

2. Exporte no `src/services/api/index.ts`
