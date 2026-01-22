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
