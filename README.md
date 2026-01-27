# React + TypeScript + Vite

Este projeto foi criado com Vite, React e TypeScript, utilizando gerenciamento de estado reativo com BehaviorSubject (RxJS).

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
│   ├── components/              # Componentes React reutilizáveis
│   │   ├── PetList/            # Lista de pets
│   │   ├── TutorList/          # Lista de tutores
│   │   ├── PetForm/            # Formulário de pet
│   │   ├── TutorForm/          # Formulário de tutor
│   │   └── ...                 # Outros componentes
│   ├── pages/                  # Páginas da aplicação
│   │   ├── PetFormPage/        # Página de formulário de pet
│   │   ├── PetDetail/          # Página de detalhes do pet
│   │   ├── TutorFormPage/      # Página de formulário de tutor
│   │   └── TutorDetail/        # Página de detalhes do tutor
│   ├── routes/                 # Configuração de rotas
│   │   └── AppRoutes.tsx       # Definição de rotas da aplicação
│   ├── stores/                 # Stores de gerenciamento de estado
│   │   ├── BaseStore.ts        # Classe base para stores
│   │   ├── PetStore.ts         # Store para gerenciar estado de pets
│   │   ├── TutorStore.ts       # Store para gerenciar estado de tutores
│   │   ├── AuthStore.ts        # Store para gerenciar autenticação
│   │   └── index.ts            # Exportações dos stores
│   ├── hooks/                  # Custom hooks
│   │   ├── useApi.ts           # Hook para requisições GET
│   │   ├── useMutation.ts      # Hook para mutações (POST, PUT, DELETE)
│   │   ├── usePaginatedList.ts # Hook para listas paginadas
│   │   ├── usePhotoManagement.ts # Hook para gerenciamento de fotos
│   │   ├── useStore.ts         # Hook para usar stores no React
│   │   └── index.ts            # Exportações dos hooks
│   ├── services/               # Camada de serviços
│   │   ├── http/
│   │   │   ├── httpClient.ts   # Cliente HTTP base com axios
│   │   │   └── index.ts        # Exportações
│   │   ├── api/
│   │   │   ├── petService.ts   # Serviço de API para pets
│   │   │   ├── tutorService.ts # Serviço de API para tutores
│   │   │   └── authService.ts  # Serviço de API para autenticação
│   │   └── facade/
│   │       ├── ApiFacade.ts    # Facade pattern para simplificar acesso à API
│   │       └── index.ts        # Exportações do facade
│   ├── contexts/               # Contextos React
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   ├── types/                  # Tipos TypeScript
│   │   └── api.types.ts        # Tipos e interfaces da API
│   ├── utils/                  # Utilitários
│   │   └── errorHandler.ts    # Utilitário para tratamento de erros
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

## 🏗️ Arquitetura

### Gerenciamento de Estado com BehaviorSubject

O projeto utiliza **BehaviorSubject** do RxJS para gerenciamento de estado reativo. Cada entidade (Pets, Tutores, Autenticação) possui seu próprio store que gerencia:

- **Estado de lista**: dados paginados, página atual, termo de busca
- **Estado de detalhe**: dados do item selecionado
- **Estado de formulário**: dados do formulário em edição/criação

#### Exemplo de uso de um Store

```typescript
import { petStore } from '../stores'
import { useStore } from '../hooks/useStore'

const PetList = () => {
  const listState = useStore(petStore.listState$)

  useEffect(() => {
    petStore.loadPets(listState.page, 10, listState.searchTerm || undefined)
  }, [listState.page, listState.searchTerm])

  const handlePageChange = (newPage: number) => {
    petStore.setPage(newPage)
  }

  return (
    <div>
      {listState.loading && <LoadingSpinner />}
      {listState.data?.content.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  )
}
```

### Padrões Arquiteturais

1. **Facade Pattern**: `ApiFacade` simplifica o acesso aos serviços de API
2. **Service Layer**: Serviços encapsulam a lógica de comunicação com a API
3. **Store Pattern**: Stores gerenciam estado reativo usando BehaviorSubject
4. **Custom Hooks**: Hooks reutilizáveis para lógica comum

## 🛠️ Tecnologias

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server rápido
- **Tailwind CSS** - Framework CSS utility-first
- **RxJS** - Biblioteca reativa para gerenciamento de estado com BehaviorSubject
- **Axios** - Cliente HTTP para requisições
- **React Router DOM** - Roteamento para aplicações React
- **PostCSS** - Ferramenta para transformar CSS
- **ESLint** - Linter para manter a qualidade do código

## 📚 Conceitos Principais

### Stores

Os stores são classes que estendem `BaseStore` e utilizam `BehaviorSubject` para gerenciar estado:

- **PetStore**: Gerencia estado de pets (lista, detalhe, formulário)
- **TutorStore**: Gerencia estado de tutores (lista, detalhe, formulário)
- **AuthStore**: Gerencia estado de autenticação

### Hook useStore

O hook `useStore` conecta os Observables do RxJS ao React, permitindo que componentes reajam automaticamente a mudanças de estado:

```typescript
const state = useStore(store.state$)
```

### Facade Pattern

O `ApiFacade` fornece uma interface simplificada para acessar os serviços de API, ocultando a complexidade dos serviços individuais e oferecendo operações compostas.
